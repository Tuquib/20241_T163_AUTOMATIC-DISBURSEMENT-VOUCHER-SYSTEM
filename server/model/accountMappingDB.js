import mongoose from "mongoose";

const accountMappingSchema = new mongoose.Schema({
  creditAccount: {
    title: { type: String, required: true },
    uacsCode: { type: String, required: true }
  },
  debitAccounts: [{
    title: { type: String, required: true },
    uacsCode: { type: String, required: true }
  }]
});

// Create compound index for efficient querying
accountMappingSchema.index({ 'creditAccount.title': 1 });

const AccountMapping = mongoose.model("AccountMapping", accountMappingSchema, "accountmappings");

export default AccountMapping; 