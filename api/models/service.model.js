import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
serviceSchema.index({ name: 'text', description: 'text' });

// Instance method to transform the output
serviceSchema.methods.toJSON = function() {
  const service = this.toObject();
  return {
    _id: service._id,
    name: service.name,
    description: service.description,
    createdBy: service.createdBy,
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  };
};

// Static method to find services by user
serviceSchema.statics.findByUser = function(userId) {
  return this.find({ createdBy: userId, isActive: true }).sort({ createdAt: -1 });
};

const Service = mongoose.model('Service', serviceSchema);
export default Service;