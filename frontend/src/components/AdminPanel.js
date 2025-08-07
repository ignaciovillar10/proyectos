import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  BarChart3,
  Package2,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function AdminPanel({ onBackToStore }) {
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
    featured: false
  });

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchProducts();
        await fetchStats();
        setIsCreating(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchProducts();
        await fetchStats();
        setEditingProduct(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchProducts();
          await fetchStats();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      stock: product.stock.toString(),
      featured: product.featured
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      stock: '',
      featured: false
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchOrders();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const createSampleOrder = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/create-sample-order`, { method: 'POST' });
      await fetchOrders();
      await fetchStats();
    } catch (error) {
      console.error('Error creating sample order:', error);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl font-semibold text-slate-700">Cargando Panel Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-2 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Panel de Administración
              </h1>
            </div>
            
            <Button onClick={onBackToStore} variant="outline">
              <Package2 className="w-4 h-4 mr-2" />
              Volver a la Tienda
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_products || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    En el catálogo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_orders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Pedidos procesados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.total_revenue || 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de ventas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.low_stock_products?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Productos &lt; 10 unidades
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productos con Stock Bajo</CardTitle>
                  <CardDescription>Productos que necesitan reabastecimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.low_stock_products?.length > 0 ? (
                    <div className="space-y-2">
                      {stats.low_stock_products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="font-medium">{product.name}</span>
                          <Badge variant="outline" className="text-orange-700">
                            {product.stock} en stock
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay productos con stock bajo</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recientes</CardTitle>
                  <CardDescription>Últimos 5 pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recent_orders?.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recent_orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="font-medium">${order.total?.toFixed(2)}</span>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">No hay pedidos aún</p>
                      <Button onClick={createSampleOrder} variant="outline">
                        Crear Pedido Demo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Productos</h2>
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Producto</DialogTitle>
                    <DialogDescription>
                      Completa la información del producto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">Electrónicos</SelectItem>
                          <SelectItem value="Beauty">Belleza</SelectItem>
                          <SelectItem value="Home & Design">Hogar & Diseño</SelectItem>
                          <SelectItem value="Personal Care">Cuidado Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        placeholder="Cantidad en stock"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Descripción del producto"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="image_url">URL de Imagen</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                      />
                      <Label htmlFor="featured">Producto destacado</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {setIsCreating(false); resetForm();}}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateProduct}>
                      Crear Producto
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.featured && <Badge>Destacado</Badge>}
                    </div>
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold">${product.price}</span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Product Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Producto</DialogTitle>
                  <DialogDescription>
                    Modifica la información del producto
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electrónicos</SelectItem>
                        <SelectItem value="Beauty">Belleza</SelectItem>
                        <SelectItem value="Home & Design">Hogar & Diseño</SelectItem>
                        <SelectItem value="Personal Care">Cuidado Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Precio</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Stock</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-image">URL de Imagen</Label>
                    <Input
                      id="edit-image"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch
                      id="edit-featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                    />
                    <Label htmlFor="edit-featured">Producto destacado</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setEditingProduct(null); resetForm();}}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateProduct}>
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
              <Button onClick={createSampleOrder} variant="outline">
                Crear Pedido Demo
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${order.total?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="shipped">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <h2 className="text-2xl font-bold mb-6">Análisis y Estadísticas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.category_stats?.length > 0 ? (
                    <div className="space-y-3">
                      {stats.category_stats.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <span className="font-medium">{cat.category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-slate-900 h-2 rounded-full"
                                style={{
                                  width: `${(cat.count / stats.total_products) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {cat.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay datos de categorías</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Productos Activos:</span>
                      <span className="font-semibold">{stats.total_products || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pedidos Totales:</span>
                      <span className="font-semibold">{stats.total_orders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ingresos Totales:</span>
                      <span className="font-semibold">${(stats.total_revenue || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Promedio Pedido:</span>
                      <span className="font-semibold">
                        ${stats.total_orders > 0 ? (stats.total_revenue / stats.total_orders).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default AdminPanel;