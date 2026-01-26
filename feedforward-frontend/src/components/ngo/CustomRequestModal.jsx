import React, { useState } from 'react';
import { Modal, Input, Button } from '../common';
import { ngoService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { FiEdit3 } from 'react-icons/fi';
import './RequestFoodModal.css'; // Reuse existing styles

const CustomRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    foodName: '',
    quantityRequested: '',
    urgencyLevel: 'MEDIUM',
    notes: '',
    pickupTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.foodName.trim()) {
      newErrors.foodName = 'Food name is required';
    }

    if (!formData.quantityRequested || formData.quantityRequested <= 0) {
      newErrors.quantityRequested = 'Quantity must be at least 1';
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required';
    } else {
      const pickupDate = new Date(formData.pickupTime);
      const now = new Date();
      if (pickupDate <= now) {
        newErrors.pickupTime = 'Pickup time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await ngoService.requestCustomFood({
        foodName: formData.foodName,
        quantityRequested: parseInt(formData.quantityRequested),
        urgencyLevel: formData.urgencyLevel,
        pickupTime: formData.pickupTime,
        notes: formData.notes,
      });

      showSuccess('Custom request sent successfully! Restaurants will be notified.');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to send request';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      foodName: '',
      quantityRequested: '',
      urgencyLevel: 'MEDIUM',
      notes: '',
      pickupTime: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Specific Food" size="medium">
      <form className="request-food-form" onSubmit={handleSubmit}>
        
        <div className="info-box" style={{marginBottom: '1.5rem', background: '#f0fdf4', borderColor: '#bbf7d0'}}>
          <div className="info-box-icon">💡</div>
          <div className="info-box-content">
            <strong>Can't find what you need?</strong>
            <p>Tell us what you're looking for. We'll check with our partner restaurants (like Jai's Kitchen) to see if they can help.</p>
          </div>
        </div>

        <Input
          label="What food do you need?"
          type="text"
          name="foodName"
          placeholder="e.g. Rice and Curry, Biryani..."
          value={formData.foodName}
          onChange={handleChange}
          error={errors.foodName}
          required
          icon={<FiEdit3 />}
        />

        <div className="input-wrapper">
          <label className="input-label">Quantity Needed</label>
          <Input
            type="number"
            name="quantityRequested"
            placeholder="Number of servings"
            value={formData.quantityRequested}
            onChange={handleChange}
            error={errors.quantityRequested}
            min="1"
            required
          />
        </div>

        <Input
          label="Preferred Pickup Time"
          type="datetime-local"
          name="pickupTime"
          value={formData.pickupTime}
          onChange={handleChange}
          error={errors.pickupTime}
          min={new Date().toISOString().slice(0, 16)}
          required
        />

        <div className="input-wrapper">
          <label className="input-label">Additional Notes (Optional)</label>
          <textarea
            name="notes"
            className="input textarea"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any dietary requirements or specific details..."
            rows={3}
          />
        </div>

        <div className="modal-footer">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomRequestModal;
