const request = require('supertest')
const { Booking, BookingService, Customer, Hotel, Image, Review, Room, Service, sequelize } = require('../models')