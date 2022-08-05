const restrauntService = require("../services/restraunt-service");

class RestrauntController {
    async fetchRestraunts(req, res) {
        try {
            const restraunts = await restrauntService.findItems({});
            res.status(200).send(restraunts);
        } catch(err) {
            return res.status(500).json({ message: 'Internal Server error !' });
        }
    }

    async createRestraunt(req, res) {
        try {
            const newItem = {
                name: 'Food plaza',
                address: 'Sector 101, Noida',
                rating: "4.2",
                taste: 'Indian',
                image: "https://drive.google.com/uc?export=view&id=1aZ2d7iPgd3tlkDBjWdM_lGNqoZjp7o1e",
                discount: '25% off'
            }
            const restraunt = await restrauntService.createItem(newItem);
            res.status(200).send(restraunt);
        } catch(err) {
            return res.status(500).json({ message: 'Internal Server error !' });
        }
    }
}



module.exports = new RestrauntController();