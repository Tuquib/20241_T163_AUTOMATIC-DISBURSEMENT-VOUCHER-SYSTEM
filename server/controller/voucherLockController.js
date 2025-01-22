import VoucherLock from "../model/voucherLockDB.js";

// Check if any voucher is being created and acquire lock
export const checkAndLockVoucher = async (req, res) => {
  try {
    const { staffEmail } = req.body;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    // First, mark any locks older than 5 minutes as inactive
    await VoucherLock.updateMany(
      {
        isActive: true,
        lockTimestamp: { $lt: fiveMinutesAgo }
      },
      {
        $set: { isActive: false }
      }
    );

    // Check if there's any active lock that's less than 5 minutes old
    const activeLock = await VoucherLock.findOne({ 
      isActive: true,
      lockTimestamp: { $gt: fiveMinutesAgo }
    });

    if (activeLock) {
      // If the lock exists and belongs to another staff
      if (activeLock.staffEmail !== staffEmail) {
        return res.status(423).json({
          error: "Another staff member is currently creating a voucher",
          lockedBy: activeLock.staffEmail,
          message: "Please wait until they finish (max 5 minutes)"
        });
      }
      // Even if it's the same staff, don't allow multiple locks
      return res.status(423).json({
        error: "You already have an active voucher creation session",
        message: "Please wait 5 minutes before creating another voucher"
      });
    }

    // Create a new lock
    const newLock = new VoucherLock({
      staffEmail,
      lockTimestamp: new Date(),
      isActive: true
    });

    await newLock.save();

    res.status(200).json({ 
      message: "Lock acquired successfully",
      lockId: newLock._id
    });
  } catch (error) {
    console.error("Lock acquisition error:", error);
    res.status(500).json({ error: "Failed to acquire lock" });
  }
};

// Release the lock (although not used in your system, keeping it for completeness)
export const releaseLock = async (req, res) => {
  try {
    const { staffEmail, lockId } = req.body;

    const lock = await VoucherLock.findOne({
      _id: lockId,
      staffEmail: staffEmail,
      isActive: true
    });

    if (!lock) {
      return res.status(404).json({ error: "Lock not found or already released" });
    }

    // Deactivate the lock
    lock.isActive = false;
    await lock.save();

    res.status(200).json({ message: "Lock released successfully" });
  } catch (error) {
    console.error("Lock release error:", error);
    res.status(500).json({ error: "Failed to release lock" });
  }
};

// Clear expired locks (runs every 5 minutes via the server)
export const clearExpiredLocks = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Deactivate all expired locks
    await VoucherLock.updateMany(
      {
        isActive: true,
        lockTimestamp: { $lt: fiveMinutesAgo }
      },
      {
        $set: { isActive: false }
      }
    );

    res.status(200).json({ message: "Expired locks cleared successfully" });
  } catch (error) {
    console.error("Clear expired locks error:", error);
    res.status(500).json({ error: "Failed to clear expired locks" });
  }
};
