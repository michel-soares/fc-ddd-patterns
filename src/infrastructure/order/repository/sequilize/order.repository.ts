import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity, 
          
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
    
  }

  async update(entity: Order): Promise<void> {
    let orderModel;
    
    try {
      orderModel = await OrderModel.findOne({
        where: {
         id:  entity.id,
        },
        rejectOnEmpty: true,        
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Order not found");
    }
    
    
    await orderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,          
        }))
            }     
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,        
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    
    const order = new Order(id, orderModel.customer_id,
            orderModel.items.map<OrderItem>(item => ( new OrderItem(
                  item.id,
                   item.name,
                   item.price,
                   item.product_id,
                   item.quantity
            )
            )
      )

    );
    
    return order;
  }

  async findAll(): Promise<Order[]> {
   
    let orders;

    try {
      orders = await OrderModel.findAll(
        {        
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Orders not found");
    }

   const result =  orders.map<Order>( o => ( new Order(
    o.id, o.customer_id, 
    o.items.map<OrderItem>(item => ( new OrderItem(
      item.id,
       item.name,
       item.price,
       item.product_id,
       item.quantity
      ))))));

        return result;
  }
}
