const College = require('../models/College');

const domainValidator = async (req, res, next) => {
  try {
    const { email, collegeId } = req.body;

    if (!email || !collegeId) {
      return res.status(400).json({ msg: 'Email and College selection are required' });
    }

    // Extract domain from email
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    const domain = emailParts[1].toLowerCase();

    // Verify the college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ msg: 'Selected college not found' });
    }

    // Verify the email domain matches the college's domain
    if (college.domain.toLowerCase() !== domain) {
      return res.status(403).json({ 
        msg: `Email domain (@${domain}) does not match the selected college domain (@${college.domain})`
      });
    }

    // Inject college domain as collegeID to body for saving in User model
    req.body.collegeID = domain;

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error in domain validation');
  }
};

module.exports = domainValidator;
