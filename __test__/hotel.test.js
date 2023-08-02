const request = require('supertest')
const { Booking, BookingService, Customer, Hotel, Image, Review, Room, Service, sequelize, Sequelize } = require('../models')
const { jwtSign } = require('../helpers/jwt')
const { encrypt } = require('../helpers/password')
const app = require('../app')
let access_token;
let hotel_access_token;
let false_access_token = 'masHardimdanMasPatra'

beforeAll(async () => {
    try{

        await sequelize.queryInterface.bulkInsert('Customers', [{
            email: 'test@mail.com',
            password: encrypt('qwerty'),
            fullName: 'Test Silalahi',
            phoneNumber: '08972828282',
            balance: 1000000,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    
        await sequelize.queryInterface.bulkInsert('Hotels', [{
            email: 'yahoooooo@mail.com',
            password: encrypt('qwerty'),
            name: 'Hore',
            location: sequelize.fn(
                'ST_GeomFromText',
                'POINT(-6.147642181387086 106.71119003020036)'
            ),
            balance: 85000,
            address: 'ini addres hotel',
            logoHotel: 'imageUrl',
            phoneNumber: '080808',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    
        await sequelize.queryInterface.bulkInsert('Services', [{
            name: 'Hore',
            HotelId: 1,
            price: 85000,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    
        await sequelize.queryInterface.bulkInsert('Rooms', [{
            HotelId: 1,
            name: 'Hore',
            capacity: 5,
            price: 85000,
            description: 'test',
            imageUrl: 'imageUrl',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    
        await sequelize.queryInterface.bulkInsert('Bookings', [
            {
                CustomerId: 1,
                RoomId: 1,
                checkIn: new Date(),
                checkOut: new Date(),
                totalPet: 1,
                grandTotal: 20000,
                petImage: 'petImage',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                CustomerId: 1,
                RoomId: 1,
                checkIn: new Date(),
                checkOut: new Date(),
                totalPet: 2,
                grandTotal: 20000,
                petImage: 'petImage',
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    
        const payload = {
            id: 1,
            fullName: "Test Silalahi",
            email: "test@mail.com", // saya tambahin, soalnya butuh email di authCustomer dan generate midtrans
        };
        // generate jwt token
        access_token = jwtSign(payload);
    
        const payload2 = {
            id: 1,
            email: 'yahoooooo@mail.com',
        };
        // generate jwt token
        hotel_access_token = jwtSign(payload2);
    }
    catch(error) {
        console.log(error, `@@@@@@@@@@ INI DARI ERROR TEST UNIT @@@@@@@@@`);
    }
})


afterAll(async () => {
    await sequelize.queryInterface.bulkDelete('Customers', null, {
        truncate: true, restartIdentity: true, cascade: true
    });

    await sequelize.queryInterface.bulkDelete('Bookings', null, {
        truncate: true, restartIdentity: true, cascade: true
    });

    await sequelize.queryInterface.bulkDelete('Hotels', null, {
        truncate: true, restartIdentity: true, cascade: true
    });

    await sequelize.queryInterface.bulkDelete('Rooms', null, {
        truncate: true, restartIdentity: true, cascade: true
    });

    await sequelize.queryInterface.bulkDelete('Services', null, {
        truncate: true, restartIdentity: true, cascade: true
    });

    await sequelize.queryInterface.bulkDelete('BookingServices', null, {
        truncate: true, restartIdentity: true, cascade: true
    });
})

describe('ENDPOINT /hotels', () => {
    describe('GET /services', () => {
        test('Successfully get Services!', async () => {
            const response = await request(app).get('/hotels/services').set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })

        test('Fail get services, invalid token', async () => {
            const response = await request(app).get('/hotels/services')
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })
    })

    describe('POST /services', () => {
        test('Sucessfully add Service!', async () => {
            const bodyReq = {
                name: 'FungusRaymond',
                price: 20000
            }

            const response = await request(app).post('/hotels/services').send(bodyReq).set({access_token: hotel_access_token})
            expect(response.status).toBe(201)
            expect(response.body).toBeInstanceOf(Object)
        })
    })

    describe ('PUT /services/:id', () => {
        test('Successfully edit Service!', async () => {
            const bodyReq = {
                name: 'FungusMike',
                price: 25000
            }

            const response = await request(app).put('/hotels/services/1').send(bodyReq).set({access_token: hotel_access_token})
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })
    })

    describe ('DELETE /services/:id', () => {
        test('Successfully delete Service!', async () => {
            const response = await request(app).delete('/hotels/services/1').set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('Fail delete Service, invalid Service ID', async () => {
            const response = await request(app).delete('/hotels/services/100').set({access_token: hotel_access_token})
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })
    })

    describe ('GET /rooms', () => {
        test('Successfully get Rooms!', async () => {
            const response = await request(app).get('/hotels/rooms').set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })
    })

    describe ('POST /rooms', () => {
        test('Successfully add new Room!', async () => {
            const bodyReq = {
                name: 'MasHardim',
                capacity: 5,
                price: 20000,
                description: '52000',
                imageUrl: 'bangMike',
                HotelId: 1
            }

            const response = await request(app).post('/hotels/rooms').send(bodyReq).set({access_token: hotel_access_token})
            expect(response.status).toBe(201)
            expect(response.body).toBeInstanceOf(Object)
        })
    })

    describe ('PUT /rooms/:id', () => {
        test('Successfully edit Room!', async () => {
            const bodyReq = {
                name: 'MasPatra',
                capacity: 5,
                price: 20000,
                description: '52000',
                imageUrl: 'bangRaymond',
                HotelId: 1
            }

            const response = await request(app).put('/hotels/rooms/1').send(bodyReq).set({access_token: hotel_access_token})
            expect(response.status).toBe(201)
            expect(response.body).toBeInstanceOf(Object)
        })

        test('Fail edit Room, invalid Room id', async () => {
            const bodyReq = {
                name: 'MasPatra',
                capacity: 5,
                price: 20000,
                description: '52000',
                imageUrl: 'bangRaymond',
                HotelId: 1
            }

            const response = await request(app).put('/hotels/rooms/100').send(bodyReq).set({access_token: hotel_access_token})
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('message','Data not found!')
        })
    })
    
    describe('DELETE /rooms/:id', () => {
        test('Room deleted successfully !', async () => {
            const response = await request(app).delete('/hotels/rooms/1').set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('fail delete room, invalid Room id', async () => {
            const response = await request(app).delete('/hotels/rooms/100').set({access_token: hotel_access_token})
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })
    })

    describe('GET /', () => {
        test('Successfully get HOTEL !', async () => {
            const response = await request(app).get('/hotels').set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })

        test('Successfully get HOTEL with query checkin & checkout!', async () => {
            const response = await request(app).get('/hotels?checkin=25/02/2025&checkout=28/02/2025&distance=100000000000000000000&totalPet=1').set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })
    })

    describe('PUT /', () => {
        test('Successfully update HOTEL !', async () => {
            const bodyReq = {
                email: 'test@mail.com',
                password: 'test',
                name: 'testPetShop',
                location: '-6.146967811061841 106.70772208847968',
                logoHotel: 'example',
                address: 'Jl. Sample 08898989',
                phoneNumber: '080808'
            }

            const response = await request(app).put('/hotels').send(bodyReq).set({access_token: hotel_access_token})
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })
    })
})