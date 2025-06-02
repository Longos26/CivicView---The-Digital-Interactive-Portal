import Service from '../models/service.model.js';


export const getServices = async (req, res) => {
  try {
    const services = await Service.findByUser(req.user.id);
    
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


export const getService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Service name is required' });
    }

    // Check if service with same name already exists for this user
    const existingService = await Service.findOne({
      name: name.trim(),
      createdBy: req.user.id,
      isActive: true
    });

    if (existingService) {
      return res.status(400).json({ message: 'A service with this name already exists' });
    }

    const service = new Service({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: req.user.id
    });

    const savedService = await service.save();
    
    res.status(201).json({
      message: 'Service created successfully',
      service: savedService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


export const updateService = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Service name is required' });
    }

    // Find the service
    const service = await Service.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if another service with same name exists (excluding current service)
    const existingService = await Service.findOne({
      name: name.trim(),
      createdBy: req.user.id,
      isActive: true,
      _id: { $ne: req.params.id }
    });

    if (existingService) {
      return res.status(400).json({ message: 'A service with this name already exists' });
    }

    // Update the service
    service.name = name.trim();
    service.description = description?.trim() || '';

    const updatedService = await service.save();

    res.status(200).json({
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};



export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Soft delete - set isActive to false
    service.isActive = false;
    await service.save();

    

    res.status(200).json({ 
      message: 'Service deleted successfully',
      serviceId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    
    res.status(500).json({ 
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


export const searchServices = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const services = await Service.find({
      createdBy: req.user.id,
      isActive: true,
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: `Found ${services.length} service(s)`,
      services,
      searchTerm: q.trim()
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ 
      message: 'Failed to search services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

