import favouriteModel from "../models/favourite.js";





export const saveFavouriteProducts = async (req, res) => {
    try {

        const { userId, favouriteProducts } = req.body;

        if (!favouriteProducts) {
            return res.status(400).json({ success: false, message: "product missing" })
        }

        const favourite = favouriteModel.create({
            userId,
            favouriteProducts
        })

        await favourite.save()
        res.status(200).json({ success: false, message: "product added to favourites" })

    } catch (error) {
        console.error('Error saving checkout data:', error);
        res.status(500).json({ success: false, message: error });
    }
}