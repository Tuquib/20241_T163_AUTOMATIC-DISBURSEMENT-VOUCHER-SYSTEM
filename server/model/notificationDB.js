import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['new_voucher', 'voucher_approved', 'task_assigned'],
        required: true
    },
    voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        required: false
    },
    staffEmail: {
        type: String,
        required: true
    },
    staffName: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient querying
notificationSchema.index({ staffEmail: 1, type: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;