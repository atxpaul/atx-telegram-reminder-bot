import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
    chatId: String,
    message: String,
    time: String,
    type: String, // 'once', 'daily', 'weekly'
    days: [Number],
});

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
