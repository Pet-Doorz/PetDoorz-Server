const request = require('supertest')
const app = require('../app')
const { Booking, BookingService, Customer, sequelize } = require("../models")
const { encrypt } = require('../helpers/password')
const { jwtSign } = require('../helpers/jwt')
let access_token;
let hotel_access_token;
let false_access_token = 'masHardimdanMasPatra'

beforeAll(async () => {
    try {

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
        console.log(error, `ERROR DARI SINI TEST @@@@@@@@@@@@@@@@@@@@@@@@@`);
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

describe('ENDPOINT /bookings', () => {
    describe('GET /', () => {
        test('Success Home!', async () => {
            const response = await request(app).get('/bookings')
            expect(response.status).toBe(200)
        })
    })

    describe('POST /', () => {
        test('Success create booking!', async () => {
            const bodyReq = {
                RoomId: 1,
                checkIn: "2023-08-29",
                checkOut: "2023-08-31",
                totalPet: 2,
                grandTotal: 140000,
                petImage: "https://picsum.photos/200/300",
                bookingServices: [1]
            }

            const response = await request(app).post('/bookings').send(bodyReq).set({ access_token })
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('Fail booking, min balance', async () => {
            const bodyReq = {
                RoomId: 1,
                checkIn: "2023-08-29",
                checkOut: "2023-08-31",
                totalPet: 2,
                grandTotal: 50000000,
                petImage: "https://picsum.photos/200/300",
                bookingServices: [1]
            }

            const response = await request(app).post('/bookings').send(bodyReq).set({ access_token })
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Validation min on balance failed')
        })

        test('Fail booking, invalid access_token', async () => {
            const bodyReq = {
                RoomId: 1,
                checkIn: "2023-08-29",
                checkOut: "2023-08-31",
                totalPet: 2,
                grandTotal: 140000,
                petImage: "https://picsum.photos/200/300",
                bookingServices: [1]
            }

            const response = await request(app).post('/bookings').send(bodyReq).set({ access_token: false_access_token })
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Fail booking, no access_token', async () => {
            const bodyReq = {
                RoomId: 1,
                checkIn: "2023-08-29",
                checkOut: "2023-08-31",
                totalPet: 2,
                grandTotal: 140000,
                petImage: "https://picsum.photos/200/300",
                bookingServices: [1]
            }

            const response = await request(app).post('/bookings').send(bodyReq)
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })
    })

    describe('PATCH /:id/process', () => {
        test('Successfully changing booking status!', async () => {
            const bodyReq = {
                petImage: 'testUrl'
            }

            const response = await request(app).patch('/bookings/1/process').send(bodyReq).set({ access_token: hotel_access_token })
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('Fail change status, no token || no hotel', async () => {
            const bodyReq = {
                petImage: 'testUrl'
            }

            const response = await request(app).patch('/bookings/1/process').send(bodyReq)
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Fail change status, invalid token', async () => {
            const bodyReq = {
                petImage: 'testUrl'
            }

            const response = await request(app).patch('/bookings/1/process').send(bodyReq).set({ access_token: false_access_token })
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', 'Invalid token')
        })

        test('Fail change status, empty petImage', async () => {
            const bodyReq = {
                petImage: ''
            }

            const response = await request(app).patch('/bookings/2/process').send(bodyReq).set({ access_token: hotel_access_token })
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Pet image is required')
        })
    })

    describe('PATCH /:id/done', () => {
        test('Successfully changing status into done !', async () => {
            const response = await request(app).patch('/bookings/1/done').set({ access_token })
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('Fail changing status, status !== "process"', async () => {
            const response = await request(app).patch('/bookings/2/done').set({ access_token })
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })

        test('Fail changing status, invalid token', async () => {
            const response = await request(app).patch('/bookings/2/done').set({ access_token: false_access_token })
            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('message', expect.any(String))
        })
    })
})

