const restrauntModel = require("../models/restraunt-model");


class RestrauntService {

    async findItems(filter) {
        const restraunts = await restrauntModel.find(filter);
        return restraunts;
    }
    async createItem(data) {
        const restraunt = await restrauntModel.create(data);
        return restraunt;
    }

}


module.exports = new RestrauntService();