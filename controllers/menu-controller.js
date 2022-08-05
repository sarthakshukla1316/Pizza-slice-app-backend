const MenuDto = require("../dtos/menu-dto");
const menuModel = require("../models/menu-model");
const menuService = require("../services/menu-service");

class MenuController {
    async fetchMenu(req, res) {
        try {
            const menus = await menuService.findItems({});
            const newMenu = menus.map(menu => new MenuDto(menu));
            res.status(200).send(newMenu);
        } catch(err) {
            return res.status(500).json({ message: 'Internal Server error !' });
        }
    }

    async createItem(req, res) {
        try {
            const newItem = {
                name: 'Dosa',
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTATO1zGVtMdq9WtH6zvngLpkTeFnVyp8B_iw&usqp=CAU',
                price: 120,
                size: 'Medium',
                restraunt: ['Pizza slice', 'Sleep Inn', 'Food plaza'],
                stock: true,
                category: 'starter'
            }
            const item = await menuService.createItem(newItem);
            res.status(200).json({ item });
        } catch(err) {
            return res.status(500).json({ message: 'Internal Server error !' });
        }
    }
}



module.exports = new MenuController();