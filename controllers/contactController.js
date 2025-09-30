import UserQuery from '../models/userQuery.js';


export const saveQuery = async(req,res)=>{
    const {name,email,phone,title,message,type} = req.body;
    try {
        const contact = await UserQuery.create({name,email,phone,type,title,message});
        res.status(200).json({
            message: 'Contact saved successfully',
            data: contact,
          });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Failed to save contact' });
    }
}

export const getAllQueries = async(req,res)=>{
    try {
        const queries = await UserQuery.find({});
        res.status(200).json({ success: true, queries });
      } catch (error) {
        console.error('Error fetching order data:', error);
        res
          .status(500)
          .json({ success: false, error: 'Error fetching order data' });
      }
}

export const deleteQuery = async(req,res)=>{
    try {
        const {id} = req.params;
        const contact = await UserQuery.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Contact deleted successfully',
            data: contact,
          });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
}

export const getOneQuery = async(req,res)=>{
    try {
        const {id} = req.params;
        const contact = await UserQuery.findById(id);
        res.status(200).json({
            message: 'Query Found',
            data: contact,
          });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
}