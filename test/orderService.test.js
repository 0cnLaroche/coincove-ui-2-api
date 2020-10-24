const assert = require('assert');
const orderService = require('../services/orderService');
const { Order } = require('../model/order');
const { Item } = require('../model/item');
const { OrderError } = require('../error');
const mockedItems = require('./mockedItems.json')
const mongoose = require('mongoose');

const TEST_DATASOURCE = "mongodb://localhost:27017/coincove-ui-2-test";
const db = mongoose.connection;


describe('orderService.js', () => {

    // Executed once
    before(() => {
        mongoose.connect(TEST_DATASOURCE, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        db.once('open', () => {
            console.log("Connected to datasource");
        })
    });

    after(()=>{
        db.close(()=>{
            console.log("connection closed")
        })
    });
    
    describe('#processOrder()', () => {

        it('Should throw OrderError on invalid orderLine item', (done) => {

            let order = new Order({
                orderLines: [{itemId: null}, {itemId: null}]
            });

            orderService.processOrder(order)
            .catch(e => {
                assert(e instanceof OrderError)
                assert.ok(true, "PASS");
                done();
            })
            .then(res => {
                assert.fail("Should fail if exception is not thrown")
                done();
            })
        })

        it('Should validate invoice lines', async () => {
            await Item.deleteMany({}).exec();
            let item1 = await Item.create(mockedItems[0]);
            let item2 = await Item.create(mockedItems[1]);

            let order = {
                    billingAddress: null,
                    shippingAddress: null,
                    orderLines: [{
                        description: "..........",
                        itemId: "222222222222222222222222",
                        units: 2,
                        price: 22.22, 
                        discount: 0
                    },{
                        description: "..........",
                        itemId: "111111111111111111111111",
                        units: 2,
                        price: 11.11, 
                        discount: -2.11
                    }],
                    taxes: [],
                    shipping: 5.0,
                    subtotal: 62.44,
                    total: 67.44,
                    paymentId: "000000000000"
                }
            let target = await orderService.processOrder(order);
            assert.ok(target);
        })
    });

    describe('#updateInventory()', () => {
        it('Should decrease inventory for each item', async () => {
            await Item.deleteMany({}).exec();
            let item1 = await Item.create(mockedItems[0]);
            let item2 = await Item.create(mockedItems[1]);

            let order = {
                    billingAddress: null,
                    shippingAddress: null,
                    orderLines: [{
                        description: "..........",
                        itemId: "222222222222222222222222",
                        units: 3,
                        price: 22.22, 
                        discount: 0
                    },{
                        description: "..........",
                        itemId: "111111111111111111111111",
                        units: 3,
                        price: 11.11, 
                        discount: -2.11
                    }],
                    taxes: [],
                    shipping: 5.0,
                    subtotal: 62.44,
                    total: 67.44,
                    paymentId: "000000000000"
            };

            await orderService.updateInventory(order.orderLines);
            let updatedItem1 = await Item.findById(mockedItems[0]._id);
            let updatedItem2 = await Item.findById(mockedItems[1]._id);

            assert.ok(updatedItem1);
            assert.strictEqual(updatedItem1.inventory, 2);
            assert.ok(updatedItem2);
            assert.strictEqual(updatedItem2.inventory, 0);
            
        })
    })

})



