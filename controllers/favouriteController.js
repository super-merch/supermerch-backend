import favouriteModel from "../models/favourite.js";

export const saveFavouriteProducts = async (req, res) => {
    try {
        const { userId, favouriteProduct } = req.body;

        if (!userId || !favouriteProduct) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID and product are required" 
            });
        }

        // Check if user already has a favorites document
        let userFavourites = await favouriteModel.findOne({ userId });

        if (userFavourites) {
            // Check if product already exists in favorites
            const productExists = userFavourites.favouriteProducts.some(
                product => product.meta?.id === favouriteProduct.meta?.id
            );

            if (!productExists) {
                userFavourites.favouriteProducts.push(favouriteProduct);
                await userFavourites.save();
            }
        } else {
            // Create new favorites document for user
            userFavourites = new favouriteModel({
                userId,
                favouriteProducts: [favouriteProduct]
            });
            await userFavourites.save();
        }

        res.status(200).json({ 
            success: true, 
            message: "Product added to favourites",
            favouriteProducts: userFavourites.favouriteProducts
        });

    } catch (error) {
        console.error('Error saving favourite product:', error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const getFavouriteItems = async (req, res) => {
    try {
        const { userId } = req.query; // Use query params for GET request

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const userFavourites = await favouriteModel.findOne({ userId });

        if (!userFavourites) {
            return res.status(200).json({
                success: true,
                favouriteProducts: [],
                message: "No favourites found"
            });
        }

        res.status(200).json({
            success: true,
            favouriteProducts: userFavourites.favouriteProducts
        });

    } catch (error) {
        console.error('Error getting favourite items:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteFavouriteItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "User ID and product ID are required"
            });
        }

        const userFavourites = await favouriteModel.findOne({ userId });

        if (!userFavourites) {
            return res.status(404).json({
                success: false,
                message: "User favourites not found"
            });
        }

        // Remove the product from favourites array
        userFavourites.favouriteProducts = userFavourites.favouriteProducts.filter(
            product => product.meta?.id !== productId
        );

        await userFavourites.save();

        res.status(200).json({
            success: true,
            message: "Product removed from favourites",
            favouriteProducts: userFavourites.favouriteProducts
        });

    } catch (error) {
        console.error('Error deleting favourite item:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};