class MenuDto {
    id;
    name;
    image;
    price;
    size;
    restraunt;
    stock;
    category;

    constructor(menu) {
        this.id = menu._id;
        this.name = menu.name;
        this.image = menu.image;
        this.price = menu.price;
        this.size = menu.size;
        this.restraunt = menu.restraunt;
        this.stock = menu.stock;
        this.category = menu.category;
    }
}


module.exports = MenuDto;