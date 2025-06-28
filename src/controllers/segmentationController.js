const Segment = require('../models/Segment');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const segmentationService = require('../services/segmentationService');

const segmentationController = {
  // Create a new segment
  createSegment: async (req, res) => {
    try {
      const { name, description, criteria, aiModel } = req.body;

      const segment = new Segment({
        name,
        description,
        criteria,
        aiModel,
        createdBy: req.user.userId
      });

      await segment.save();

      res.status(201).json({
        success: true,
        message: 'Segment created successfully',
        data: { segment }
      });
    } catch (error) {
      console.error('Create segment error:', error);
      res.status(500).json({
        success: false,
        message: error.code === 11000 ? 'Segment name already exists' : 'Server error'
      });
    }
  },

  // Get all segments
  getSegments: async (req, res) => {
    try {
      const segments = await Segment.find({ isActive: true })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { segments }
      });
    } catch (error) {
      console.error('Get segments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get segment by ID
  getSegmentById: async (req, res) => {
    try {
      const segment = await Segment.findById(req.params.id)
        .populate('users.userId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email');

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      res.json({
        success: true,
        data: { segment }
      });
    } catch (error) {
      console.error('Get segment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Run AI segmentation
  runSegmentation: async (req, res) => {
    try {
      const { segmentId, algorithm = 'rfm' } = req.body;

      const segment = await Segment.findById(segmentId);
      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      // Run segmentation algorithm
      const result = await segmentationService.runSegmentation(algorithm, segment.criteria);

      // Update segment with results
      segment.users = result.users;
      segment.aiModel = {
        ...segment.aiModel,
        algorithm,
        lastTrained: new Date(),
        accuracy: result.accuracy,
        parameters: result.parameters
      };

      await segment.save();

      res.json({
        success: true,
        message: 'Segmentation completed successfully',
        data: {
          segment,
          metrics: result.metrics
        }
      });
    } catch (error) {
      console.error('Run segmentation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during segmentation'
      });
    }
  },

  // Get segmentation analytics
  getAnalytics: async (req, res) => {
    try {
      const analytics = await segmentationService.getAnalytics();

      res.json({
        success: true,
        data: { analytics }
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Update segment
  updateSegment: async (req, res) => {
    try {
      const { name, description, criteria, isActive } = req.body;

      const segment = await Segment.findByIdAndUpdate(
        req.params.id,
        { name, description, criteria, isActive },
        { new: true, runValidators: true }
      );

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      res.json({
        success: true,
        message: 'Segment updated successfully',
        data: { segment }
      });
    } catch (error) {
      console.error('Update segment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Delete segment
  deleteSegment: async (req, res) => {
    try {
      const segment = await Segment.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      res.json({
        success: true,
        message: 'Segment deleted successfully'
      });
    } catch (error) {
      console.error('Delete segment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = segmentationController;