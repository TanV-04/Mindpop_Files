import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supportService } from '../../utils/apiService';

const HelpSupport = () => {
  const [supportData, setSupportData] = useState({
    subject: '',
    message: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupportData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use the supportService instead of direct fetch
      await supportService.createTicket(supportData);
      
      toast.success('Support request submitted successfully. We will get back to you soon!');
      
      // Reset form
      setSupportData({
        subject: '',
        message: '',
        email: ''
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit support request');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="help-support">
      <h2 className="text-2xl font-bold text-[#66220B] mb-6">Help & Support</h2>
      
      {/* Contact Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Contact Support</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Subject</label>
            <input 
              type="text" 
              name="subject"
              value={supportData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
              placeholder="What is your issue about?"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={supportData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
              placeholder="Where should we reply to?"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea 
              name="message"
              value={supportData.message}
              onChange={handleChange}
              rows="6"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
              placeholder="Please describe your issue in detail"
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-[#F09000] text-white py-2 px-4 rounded-lg hover:bg-[#D87D00] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div className="faq-item">
            <h4 className="font-medium text-gray-800 mb-2">What is Seguin Form Board?</h4>
            <p className="text-gray-600">
              The Seguin Form Board is a cognitive game designed to improve hand-eye coordination, 
              spatial awareness, and visual processing skills. Players need to match shapes to 
              their corresponding slots as quickly and accurately as possible.
            </p>
          </div>
          
          <div className="faq-item">
            <h4 className="font-medium text-gray-800 mb-2">How is my progress measured?</h4>
            <p className="text-gray-600">
              Your progress is measured based on completion time, accuracy, and consistency across 
              multiple sessions. We analyze your performance and compare it with standard benchmarks 
              to provide meaningful insights into your cognitive development.
            </p>
          </div>
          
          <div className="faq-item">
            <h4 className="font-medium text-gray-800 mb-2">Can I share my progress with others?</h4>
            <p className="text-gray-600">
              Yes, you can share your progress with teachers or caregivers by enabling the &quot;Share Progress 
              with Teachers&quot; option in your Privacy Settings. This allows authorized individuals to view 
              your performance data and track your improvement.
            </p>
          </div>
          
          <div className="faq-item">
            <h4 className="font-medium text-gray-800 mb-2">How often should I practice the games?</h4>
            <p className="text-gray-600">
              For optimal results, we recommend practicing each game for 10-15 minutes, 3-5 times per week. 
              Consistent practice over time yields the best cognitive development outcomes.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="contact-method p-4 bg-white rounded-lg shadow-sm">
            <div className="icon-container mb-3 text-[#F09000]">
              <i className="fa fa-envelope text-3xl"></i>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Email Support</h4>
            <p className="text-gray-600 mb-2">Available 24/7, typical response within 24 hours</p>
            <a href="mailto:support@cognitivegames.com" className="text-[#F09000] hover:underline">
              support@cognitivegames.com
            </a>
          </div>
          
          <div className="contact-method p-4 bg-white rounded-lg shadow-sm">
            <div className="icon-container mb-3 text-[#F09000]">
              <i className="fa fa-phone text-3xl"></i>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Phone Support</h4>
            <p className="text-gray-600 mb-2">Monday-Friday, 9:00 AM - 5:00 PM (EST)</p>
            <a href="tel:+18005551234" className="text-[#F09000] hover:underline">
              +1 (800) 555-1234
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;