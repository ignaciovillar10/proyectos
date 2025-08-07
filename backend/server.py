from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pymongo
import os
import uuid
from datetime import datetime

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "ecommerce_db")
client = pymongo.MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
products_collection = db.products
users_collection = db.users
carts_collection = db.carts
orders_collection = db.orders

# Pydantic models
class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int
    featured: bool = False

class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Cart(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: str
    items: List[CartItem]
    total: float
    created_at: datetime
    updated_at: datetime

class User(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

class Order(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: str
    items: List[CartItem]
    total: float
    status: str  # pending, paid, shipped, delivered, cancelled
    payment_intent_id: Optional[str] = None
    shipping_address: dict
    created_at: datetime

# Initialize sample products
@app.on_event("startup")
async def startup_event():
    # Check if products already exist
    if products_collection.count_documents({}) == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "iMac 24\" Silver",
                "description": "Powerful all-in-one desktop with M1 chip, perfect for professionals and creators.",
                "price": 1299.99,
                "category": "Electronics",
                "image_url": "https://images.unsplash.com/photo-1612631656340-ad1e06d3a0de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBwcm9kdWN0c3xlbnwwfHx8fDE3NTQ2MDE5OTd8MA&ixlib=rb-4.1.0&q=85",
                "stock": 15,
                "featured": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "MacBook Pro Setup",
                "description": "Professional workspace setup with MacBook Pro, perfect for remote work and productivity.",
                "price": 2499.99,
                "category": "Electronics",
                "image_url": "https://images.unsplash.com/photo-1612999087483-b6b89bcf07dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBwcm9kdWN0c3xlbnwwfHx8fDE3NTQ2MDE5OTd8MA&ixlib=rb-4.1.0&q=85",
                "stock": 8,
                "featured": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Luxury Cosmetic Collection",
                "description": "Premium black and gold cosmetic collection for the modern professional.",
                "price": 299.99,
                "category": "Beauty",
                "image_url": "https://images.unsplash.com/photo-1641471159312-6e09825bc10b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBwcm9kdWN0c3xlbnwwfHx8fDE3NTQ2MDE5OTd8MA&ixlib=rb-4.1.0&q=85",
                "stock": 25,
                "featured": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Modern Design Object",
                "description": "Contemporary 3D design piece that adds sophistication to any space.",
                "price": 199.99,
                "category": "Home & Design",
                "image_url": "https://images.unsplash.com/photo-1728467459756-211f3c738697?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwcm9kdWN0c3xlbnwwfHx8fDE3NTQ2MDE5OTd8MA&ixlib=rb-4.1.0&q=85",
                "stock": 12,
                "featured": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Professional Oral Care Set",
                "description": "Premium dental care products for maintaining professional appearance.",
                "price": 49.99,
                "category": "Personal Care",
                "image_url": "https://images.unsplash.com/photo-1691096673040-1632eb4b0a9d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxlY29tbWVyY2UlMjBwcm9kdWN0c3xlbnwwfHx8fDE3NTQ2MDIwMDN8MA&ixlib=rb-4.1.0&q=85",
                "stock": 50,
                "featured": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Skincare Essentials",
                "description": "Professional-grade skincare products for daily routine.",
                "price": 159.99,
                "category": "Beauty",
                "image_url": "https://images.pexels.com/photos/8468149/pexels-photo-8468149.jpeg",
                "stock": 30,
                "featured": False
            }
        ]
        products_collection.insert_many(sample_products)

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "EcommercePro API"}

# Admin Dashboard Stats
@app.get("/api/admin/stats")
async def get_admin_stats():
    try:
        # Get basic statistics
        total_products = products_collection.count_documents({})
        total_orders = orders_collection.count_documents({})
        total_revenue = 0
        
        # Calculate total revenue from orders
        orders = list(orders_collection.find({"status": "paid"}))
        if orders:
            total_revenue = sum(order.get("total", 0) for order in orders)
        
        # Get low stock products
        low_stock_products = list(products_collection.find({"stock": {"$lt": 10}}, {"_id": 0}))
        
        # Get recent orders
        recent_orders = list(orders_collection.find({}, {"_id": 0}).sort("created_at", -1).limit(5))
        
        # Category distribution
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$project": {"category": "$_id", "count": 1, "_id": 0}}
        ]
        category_stats = list(products_collection.aggregate(pipeline))
        
        return {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "low_stock_products": low_stock_products,
            "recent_orders": recent_orders,
            "category_stats": category_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# Admin Product Management
@app.post("/api/admin/products", response_model=Product)
async def create_product(product_data: dict):
    try:
        new_product = {
            "id": str(uuid.uuid4()),
            "name": product_data.get("name"),
            "description": product_data.get("description"),
            "price": float(product_data.get("price")),
            "category": product_data.get("category"),
            "image_url": product_data.get("image_url"),
            "stock": int(product_data.get("stock")),
            "featured": product_data.get("featured", False)
        }
        
        products_collection.insert_one(new_product)
        return new_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")

@app.put("/api/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: dict):
    try:
        updated_product = {
            "name": product_data.get("name"),
            "description": product_data.get("description"),
            "price": float(product_data.get("price")),
            "category": product_data.get("category"),
            "image_url": product_data.get("image_url"),
            "stock": int(product_data.get("stock")),
            "featured": product_data.get("featured", False)
        }
        
        result = products_collection.update_one(
            {"id": product_id},
            {"$set": updated_product}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Return updated product
        updated = products_collection.find_one({"id": product_id}, {"_id": 0})
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")

@app.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str):
    try:
        result = products_collection.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")

# Order Management
@app.get("/api/admin/orders")
async def get_all_orders():
    try:
        orders = list(orders_collection.find({}, {"_id": 0}).sort("created_at", -1))
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@app.put("/api/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict):
    try:
        new_status = status_data.get("status")
        if new_status not in ["pending", "paid", "shipped", "delivered", "cancelled"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = orders_collection.update_one(
            {"id": order_id},
            {"$set": {"status": new_status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Order status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

# Create sample order for demo
@app.post("/api/create-sample-order")
async def create_sample_order():
    try:
        sample_order = {
            "id": str(uuid.uuid4()),
            "user_id": None,
            "session_id": "demo_session",
            "items": [
                {"product_id": "sample", "quantity": 2, "price": 299.99}
            ],
            "total": 599.98,
            "status": "paid",
            "payment_intent_id": "pi_demo_123",
            "shipping_address": {
                "name": "Demo Customer",
                "address": "123 Demo Street",
                "city": "Demo City",
                "postal_code": "12345",
                "country": "US"
            },
            "created_at": datetime.now()
        }
        
        orders_collection.insert_one(sample_order)
        return {"message": "Sample order created", "order": sample_order}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating sample order: {str(e)}")

@app.get("/api/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    
    products = list(products_collection.find(query, {"_id": 0}))
    return products

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = products_collection.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/categories")
async def get_categories():
    categories = products_collection.distinct("category")
    return {"categories": categories}

# Cart operations
@app.get("/api/cart/{session_id}")
async def get_cart(session_id: str):
    cart = carts_collection.find_one({"session_id": session_id}, {"_id": 0})
    if not cart:
        # Create empty cart
        new_cart = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": None,
            "items": [],
            "total": 0.0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        carts_collection.insert_one(new_cart)
        return new_cart
    return cart

@app.post("/api/cart/{session_id}/add")
async def add_to_cart(session_id: str, item: CartItem):
    # Get product to verify price and stock
    product = products_collection.find_one({"id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["stock"] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    cart = carts_collection.find_one({"session_id": session_id})
    if not cart:
        cart = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": None,
            "items": [],
            "total": 0.0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    
    # Update item in cart
    items = cart["items"]
    existing_item = None
    for i, existing in enumerate(items):
        if existing["product_id"] == item.product_id:
            existing_item = i
            break
    
    if existing_item is not None:
        items[existing_item]["quantity"] += item.quantity
        items[existing_item]["price"] = product["price"]
    else:
        items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product["price"]
        })
    
    # Calculate total
    total = sum(item["price"] * item["quantity"] for item in items)
    
    cart.update({
        "items": items,
        "total": total,
        "updated_at": datetime.now()
    })
    
    # Upsert cart
    carts_collection.replace_one(
        {"session_id": session_id},
        cart,
        upsert=True
    )
    
    return {"message": "Item added to cart", "cart": cart}

@app.put("/api/cart/{session_id}/update")
async def update_cart_item(session_id: str, item: CartItem):
    cart = carts_collection.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find and update item
    items = cart["items"]
    for i, existing in enumerate(items):
        if existing["product_id"] == item.product_id:
            if item.quantity <= 0:
                items.pop(i)
            else:
                items[i]["quantity"] = item.quantity
            break
    else:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    # Calculate total
    total = sum(item["price"] * item["quantity"] for item in items)
    
    cart.update({
        "items": items,
        "total": total,
        "updated_at": datetime.now()
    })
    
    carts_collection.replace_one({"session_id": session_id}, cart)
    return {"message": "Cart updated", "cart": cart}

@app.delete("/api/cart/{session_id}/clear")
async def clear_cart(session_id: str):
    cart = carts_collection.find_one({"session_id": session_id})
    if cart:
        cart.update({
            "items": [],
            "total": 0.0,
            "updated_at": datetime.now()
        })
        carts_collection.replace_one({"session_id": session_id}, cart)
    
    return {"message": "Cart cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)