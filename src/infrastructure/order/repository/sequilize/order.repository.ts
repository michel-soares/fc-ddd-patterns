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
    let orderModel: OrderModel;    

    // Pesquisando para atualizar,
    
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
    // Não encontrei um comando para atualizar a order e todos os itens automaticamente, inclusive preparado para remover e incluir novos.
    
    // Verificando os itens que ainda existem para atualizar ou que não existe mais para apagar
    await orderModel.items.forEach(itemBanco => {
        const itemEncontradoParametro = entity.items.find(itemParametros => itemParametros.id == itemBanco.id);
        if(itemEncontradoParametro == null){          
          itemBanco.destroy();
        }else{
          itemBanco.update(
                      {                        
                        name: itemEncontradoParametro.name,
                        price: itemEncontradoParametro.price,
                        product_id: itemEncontradoParametro.productId,
                        quantity: itemEncontradoParametro.quantity,                           
                      },
          )
        }
    });

    // Verificando os itens novos para adicionar
    await entity.items.forEach(itemParametro => {
      const itemEncontradoBanco = orderModel.items.find(itemBanco => itemBanco.id == itemParametro.id);
      if(itemEncontradoBanco == null){
        OrderItemModel.create(
          {    
            order_id: entity.id,
            id: itemParametro.id,                    
            name: itemParametro.name,
            price: itemParametro.price,
            product_id: itemParametro.productId,
            quantity: itemParametro.quantity,                           
          }
        )
        //.then(x => orderModel.items.push(x)) ;
        

      }
    }
    );
    
    //atualizando  order    
    await orderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),                  
        });
          
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
