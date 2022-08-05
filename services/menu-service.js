const menuModel = require("../models/menu-model");

class MenuService {

    async findItems(filter) {
        const menus = await menuModel.find(filter);
        return menus;
    }
    async createItem(data) {
        const menu = await menuModel.create(data);
        return menu;
    }

}


module.exports = new MenuService();