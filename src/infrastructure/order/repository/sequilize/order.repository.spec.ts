import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      //logging: console.log,
      //logQueryParameters:true,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();

    jest.setTimeout(100000);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });


  it("should update an order Change Item", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("1234", "Customer 2");
    customer2.changeAddress(address);
    await customerRepository.create(customer2);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );    

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        }  
      ],
    });


    // Incluindo um produto a mais
    
    const product2 = new Product("1234", "Product 2", 10);
    await productRepository.create(product2);
    const ordemNewItem = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      1
    );

    
    const order2 = new Order("123", customer2.id, [ordemNewItem]);
    // Update Order
    await orderRepository.update(order2);
    
    const orderModelUpdated = await OrderModel.findOne({
      where: { id: order.id },
      include: [{ model: OrderItemModel }],
    });
    
    expect(orderModelUpdated.toJSON()).toStrictEqual({
      id: order2.id,
      customer_id: customer2.id,
      total: order2.total(),
      items: [
        {
          id: ordemNewItem.id,
          name: ordemNewItem.name,
          price: ordemNewItem.price,
          quantity: ordemNewItem.quantity,
          order_id: order2.id,
          product_id:  product2.id,
        }  
      ],
    });
    
    /*
    expect(orderModelUpdated.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer2.id,
      total: order.total(),
      items: [{
        id: ordemItem.id,
        name: ordemItem.name,
        price: ordemItem.price,
        quantity: ordemItem.quantity,
        order_id: order.id,
        product_id: product.id,
      },   {
        id: ordemNewItem.id,
        name: ordemNewItem.name,
        price: ordemNewItem.price,
        quantity: ordemNewItem.quantity,
        order_id: order.id,
        product_id: product2.id,
      },  ],
    });
    */
    


  });

  it("should update an order Add New Item", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("1234", "Customer 2");
    customer2.changeAddress(address);
    await customerRepository.create(customer2);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );    

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        }  
      ],
    });


    // Incluindo um produto a mais
    
    const product2 = new Product("1234", "Product 2", 10);
    await productRepository.create(product2);
    const ordemNewItem = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      1
    );

    
    const order2 = new Order("123", customer2.id, [ordemItem, ordemNewItem]);
    // Update Order
    await orderRepository.update(order2);
    
    const orderModelUpdated = await OrderModel.findOne({
      where: { id: order.id },
      include: [{ model: OrderItemModel }],
    });
  
    expect(orderModelUpdated.toJSON()).toStrictEqual({
      id: order2.id,
      customer_id: customer2.id,
      total: order2.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: order.id,
          product_id: product.id,
        },
        {
          id: ordemNewItem.id,
          name: ordemNewItem.name,
          price: ordemNewItem.price,
          quantity: ordemNewItem.quantity,
          order_id: order2.id,
          product_id:  product2.id,
        }  
      ],
    });
   
  });

  
  it("should find an order", async () => {
    
    const customerRepository = new CustomerRepository();
    const customer = new Customer("12345", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("12345", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      3
    );

    const order = new Order("12345", "12345", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderResult = await orderRepository.find(order.id);

    expect(order).toStrictEqual(orderResult);
    
  });

  it("should find all", async () => {
    
    const customerRepository = new CustomerRepository();
    const customer = new Customer("12345", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("12345", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      3
    );

    const ordemItem2 = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("12345", "12345", [ordemItem]);
    const order2 = new Order("123456", "12345", [ordemItem2]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);
    await orderRepository.create(order2);

    const ordersResult = await orderRepository.findAll();

    expect(ordersResult.length).toBe(2);
    expect(ordersResult.find(x => x.id == order.id)).toStrictEqual(order);
    expect(ordersResult.find(x => x.id == order2.id)).toStrictEqual(order2);

  });


});
