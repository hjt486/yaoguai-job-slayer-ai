import React, { useRef, useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';

const WorkdayForm = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Add this function after the state declaration
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    console.log('[YaoguaiAI] Input change:', { field: id, value });
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  // Add selectedFile state
  const [selectedFile, setSelectedFile] = useState(null);

  // Update handleFileChange to set the file name
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name);
      setSelectedFile(file.name);
    }
  };

  return (
    <div className="container">
      <h2>workday</h2>

      {/* Upload Resume Section */}
      <div data-automation-id="quickApplyPage">
        <div data-automation-id="richText" className="css-1e8xi5p">
          Make completing your job application easier by uploading your resume or CV.
        </div>
        <div className="css-18mudl3">
          <div data-automation-id="formField-" className="css-7t35fz">
            <div className="css-15rz5ap">
              <div style={{ width: '100%', maxWidth: '704px', minWidth: '280px' }}>
                <div className="css-r2m5aj">
                  Upload either DOC, DOCX, HTML, PDF, or TXT file types (5MB max)
                </div>
                <div data-automation-id="quickApplyUpload" className="css-1s544wy">
                  <div className="css-wtpnzt">
                    <div data-automation-id="file-upload-drop-zone" color="#0875e1" className="css-1ikudie">
                      <div className="css-131uyni">
                        <span className="css-hnro9k">
                          {/* SVG icon can be included here if needed */}
                        </span>
                      </div>
                      <div className="css-qquq3v">Drop file here</div>
                      <div className="css-xszj4y">
                        <div className="css-n80z3z">or</div>
                        <button 
                          type="button" 
                          data-automation-id="select-files" 
                          id="input-1" 
                          className="css-1i4yvvz"
                          onClick={handleFileSelect}
                        >
                          <span className="css-pplshs">Select file</span>
                        </button>
                      </div>
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      data-automation-id="file-upload-input-ref" 
                      className="css-1hyfx7x"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    {/* Display the selected file name */}
                    {selectedFile && <div className="css-file-name">Uploaded: {selectedFile}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div data-automation-id="legalNameSection">
        <h3>Name</h3>
        <label htmlFor="firstName">First Name</label>
        <input 
          type="text" 
          id="firstName" 
          data-automation-id="legalNameSection_firstName" 
          placeholder="First Name" 
          value={formData.firstName}
          onChange={handleInputChange} 
        />
        <label htmlFor="lastName">Last Name</label>
        <input 
          type="text" 
          id="lastName" 
          data-automation-id="legalNameSection_lastName" 
          placeholder="Last Name" 
          value={formData.lastName}
          onChange={handleInputChange} 
        />
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          data-automation-id="email" 
          placeholder="Email Address" 
          value={formData.email}
          onChange={handleInputChange} 
        />
        <label htmlFor="phone">Phone Number</label>
        <input 
          type="text" 
          id="phone" 
          data-automation-id="phone-number" 
          placeholder="Phone Number" 
          value={formData.phone}
          onChange={handleInputChange} 
        />
      </div>

      {/* Address Section */}
      <div data-automation-id="addressSection">
        <h3>Address</h3>
        <label htmlFor="address">Address Line 1</label>
        <input 
          type="text" 
          id="address" 
          data-automation-id="addressSection_addressLine1" 
          placeholder="Street Address" 
          value={formData.address}
          onChange={handleInputChange} 
        />
        <label htmlFor="city">City</label>
        <input 
          type="text" 
          id="city" 
          data-automation-id="addressSection_city" 
          placeholder="City" 
          value={formData.city}
          onChange={handleInputChange} 
        />
        <label htmlFor="state">State</label>
        <select 
          id="state" 
          data-automation-id="addressSection_countryRegion" 
          value={formData.state}
          onChange={handleInputChange}
        >
          <option value="">Select State</option>
          <option value="TX">Texas</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </select>
        <label htmlFor="zipCode">Postal Code</label>
        <input 
          type="text" 
          id="zipCode" 
          data-automation-id="addressSection_postalCode" 
          placeholder="ZIP Code" 
          value={formData.zipCode}
          onChange={handleInputChange} 
        />
      </div>

      <div className="section">
        <button type="button" id="submit-form">Save and Continue</button>
      </div>
    </div>
  );
};

export default WorkdayForm;
