import express from 'express';
import Notification from '../model/notificationDB.js';

const router = express.Router();

// Get notifications based on role
router.get('/notifications', async (req, res) => {
    try {
        const { staffEmail, role } = req.query;
        
        if (!staffEmail) {
            return res.status(400).json({ message: 'Staff email is required' });
        }

        let query = { staffEmail };

        // Filter notifications based on role
        if (role === 'admin') {
            query.type = 'new_voucher'; // Admin only sees new voucher notifications
        } else {
            // Staff sees voucher approval and task notifications
            query.type = { $in: ['voucher_approved', 'task_assigned'] };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.patch('/notifications/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create notification
router.post('/notifications', async (req, res) => {
    try {
        const { message, type, voucherId, staffName, staffEmail } = req.body;

        if (!message || !staffEmail || !type) {
            return res.status(400).json({ 
                message: 'Message, staff email, and type are required' 
            });
        }

        // Validate notification type
        if (!['new_voucher', 'voucher_approved', 'task_assigned'].includes(type)) {
            return res.status(400).json({ 
                message: 'Invalid notification type' 
            });
        }

        const notification = new Notification({
            message,
            type,
            voucherId,
            staffName,
            staffEmail,
            read: false,
            createdAt: new Date()
        });

        const newNotification = await notification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(400).json({ message: error.message });
    }
});

export default router;
