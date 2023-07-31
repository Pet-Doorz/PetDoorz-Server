// Supaya customer hanya bisa RU data miliknya
const { Customer } = require("../models")

async function authorizationCustomer(req, res, next) {
    try {
        const { id } = req.params
        const { id: authenticationId } = req.customer

        const customer = await Customer.findByPk(id)
        if (customer.id !== authenticationId) throw { name: "Forbidden" }

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authorizationCustomer