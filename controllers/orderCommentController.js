import OrderComment from "../models/orderComments.js";

export const addComment = async (req, res) => {
    try {
        const { OrderId, comments } = req.body;

        const newComment = new OrderComment({
            OrderId,
            comments: [comments],
        });
        await newComment.save();

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteComment = async (req, res) => {
    try {
        const { OrderId } = req.params;
        const deleted = await OrderComment.deleteOne({ OrderId: OrderId });
        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const updateComment = async (req, res) => {
    try {
        const { OrderId } = req.params;
        const { comments } = req.body
        const found = await OrderComment.findOne({ OrderId: OrderId });
        if (found) {
            const update = await OrderComment.updateOne({ OrderId: OrderId }, { $set: { comments: comments } });
            res.status(200).json(update);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCommentById = async (req, res) => {
    try {
        const { OrderId } = req.params;
        const comment = await OrderComment.findOne({ OrderId: OrderId });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}