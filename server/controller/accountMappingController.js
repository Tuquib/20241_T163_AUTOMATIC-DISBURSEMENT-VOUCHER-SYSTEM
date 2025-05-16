import AccountMapping from "../model/accountMappingDB.js";

// Get debit accounts for a credit account
export const getDebitAccounts = async (req, res) => {
  try {
    const { creditAccountTitle } = req.params;
    console.log("Looking for creditAccount.title:", creditAccountTitle);
    const mapping = await AccountMapping.findOne({
      'creditAccount.title': { $regex: `^${creditAccountTitle}$`, $options: 'i' }
    });

    if (!mapping) {
      return res.status(404).json({ message: "No mapping found for this credit account" });
    }

    res.status(200).json({
      creditAccount: mapping.creditAccount,
      debitAccounts: mapping.debitAccounts
    });
  } catch (error) {
    console.error("Error getting debit accounts:", error);
    res.status(500).json({ message: "Error getting debit accounts" });
  }
};

// Create new account mapping
export const createAccountMapping = async (req, res) => {
  try {
    const { creditAccount, debitAccounts } = req.body;

    const mapping = new AccountMapping({
      creditAccount,
      debitAccounts
    });

    await mapping.save();
    res.status(201).json(mapping);
  } catch (error) {
    console.error("Error creating account mapping:", error);
    res.status(500).json({ message: "Error creating account mapping" });
  }
};

// Update account mapping
export const updateAccountMapping = async (req, res) => {
  try {
    const { creditAccountTitle } = req.params;
    const { creditAccount, debitAccounts } = req.body;

    const mapping = await AccountMapping.findOneAndUpdate(
      { 'creditAccount.title': creditAccountTitle },
      { creditAccount, debitAccounts },
      { new: true }
    );

    if (!mapping) {
      return res.status(404).json({ message: "No mapping found for this credit account" });
    }

    res.status(200).json(mapping);
  } catch (error) {
    console.error("Error updating account mapping:", error);
    res.status(500).json({ message: "Error updating account mapping" });
  }
};

// Delete account mapping
export const deleteAccountMapping = async (req, res) => {
  try {
    const { creditAccountTitle } = req.params;

    const mapping = await AccountMapping.findOneAndDelete({
      'creditAccount.title': creditAccountTitle
    });

    if (!mapping) {
      return res.status(404).json({ message: "No mapping found for this credit account" });
    }

    res.status(200).json({ message: "Account mapping deleted successfully" });
  } catch (error) {
    console.error("Error deleting account mapping:", error);
    res.status(500).json({ message: "Error deleting account mapping" });
  }
};

export const getAllCreditAccounts = async (req, res) => {
  try {
    const mappings = await AccountMapping.find({}, { 'creditAccount': 1, _id: 0 });
    const credits = mappings.map(m => m.creditAccount);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching credit accounts' });
  }
}; 