import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  previousStatus: {
    type: String,
    default: null,
  },
  newStatus: {
    type: String,
    default: null,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
}, {
  timestamps: true, // adds createdAt
});

const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);

export default ComplaintHistory;
