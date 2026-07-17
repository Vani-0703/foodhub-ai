import User from "../models/User.js";

// POST /api/auth/sync
// Called right after Firebase signup/login on the client. Creates the
// Mongo user document on first login, otherwise just returns it.
export const syncUser = async (req, res) => {
  const { uid, name, email, photoURL } = req.firebaseDecoded;
  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    user = await User.create({
      firebaseUid: uid,
      name: name || email.split("@")[0],
      email,
      photoURL: photoURL || "",
      role: "customer",
    });
  }

  res.json(user);
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};

// PATCH /api/auth/role  (dev/demo helper – lets a user become a restaurant owner)
export const requestOwnerRole = async (req, res) => {
  req.user.role = "owner";
  await req.user.save();
  res.json(req.user);
};

// PATCH /api/auth/profile
export const updateProfile = async (req, res) => {
  const { name, phone, addresses } = req.body;
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  if (addresses) req.user.addresses = addresses;
  await req.user.save();
  res.json(req.user);
};
