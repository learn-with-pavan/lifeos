import {
    Camera,
    Check,
    Edit3,
    Mail,
    MapPin,
    Phone,
    Save,
    UserRound,
    X,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getUserProfile,
    updateUserProfile,
    uploadProfileImage,
} from "../services/userService";

import LoadingState from "../components/LoadingState";

import "../styles/profile.css";

const getInitials = (
    name
) => {

    if (!name) {
        return "U";
    }

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 1) {
        return parts[0]
            .charAt(0)
            .toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
};


const createFormState = (
    user
) => ({
    name:
        user?.name || "",

    phone:
        user?.phone || "",

    addressLine1:
        user?.address?.addressLine1 || "",

    addressLine2:
        user?.address?.addressLine2 || "",

    city:
        user?.address?.city || "",

    state:
        user?.address?.state || "",

    postalCode:
        user?.address?.postalCode || "",

    country:
        user?.address?.country || "India",
});


const Profile = () => {

    const fileInputRef =
        useRef(null);


    const [
        user,
        setUser,
    ] = useState(null);


    const [
        form,
        setForm,
    ] = useState(
        createFormState(null)
    );


    const [
        editing,
        setEditing,
    ] = useState(false);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        uploadingImage,
        setUploadingImage,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    const loadProfile =
        async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getUserProfile();

                const profile =
                    response?.user;

                setUser(profile);

                setForm(
                    createFormState(
                        profile
                    )
                );

            } catch (error) {

                console.error(
                    "Failed to load profile:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    "Unable to load your profile."
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        loadProfile();

    }, []);


    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;

        setForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    const handleEdit = () => {

        setForm(
            createFormState(
                user
            )
        );

        setError("");
        setSuccess("");
        setEditing(true);
    };


    const handleCancel = () => {

        setForm(
            createFormState(
                user
            )
        );

        setError("");
        setSuccess("");
        setEditing(false);
    };


    const handleSave = async (
        event
    ) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const profileData = {
                name:
                    form.name.trim(),

                phone:
                    form.phone.trim(),

                address: {
                    addressLine1:
                        form.addressLine1.trim(),

                    addressLine2:
                        form.addressLine2.trim(),

                    city:
                        form.city.trim(),

                    state:
                        form.state.trim(),

                    postalCode:
                        form.postalCode.trim(),

                    country:
                        form.country.trim() ||
                        "India",
                },
            };


            const response =
                await updateUserProfile(
                    profileData
                );


            const updatedUser =
                response?.user;


            if (updatedUser) {

                setUser(
                    updatedUser
                );

                setForm(
                    createFormState(
                        updatedUser
                    )
                );


                const storedUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                    );


                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...storedUser,
                        id:
                            updatedUser._id ||
                            updatedUser.id,
                        name:
                            updatedUser.name,
                        email:
                            updatedUser.email,
                        role:
                            updatedUser.role,
                        profileImage:
                            updatedUser.profileImage ||
                            "",
                    })
                );
            }


            setEditing(false);

            setSuccess(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to update your profile."
            );

        } finally {

            setSaving(false);
        }
    };


    const handleImageSelect = async (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        setError("");
        setSuccess("");


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            setError(
                "Please select a JPG, PNG, WEBP, or GIF image."
            );

            event.target.value = "";

            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setError(
                "Profile image must be smaller than 5 MB."
            );

            event.target.value = "";

            return;
        }

        try {
            setUploadingImage(true);
            const response =await uploadProfileImage(file);

            const updatedUser = response?.user;

            if (updatedUser) {
                setUser(updatedUser);
                setForm(createFormState(updatedUser));

                const storedUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                    );


                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...storedUser,
                        id:
                            updatedUser._id ||
                            updatedUser.id,
                        name:
                            updatedUser.name,
                        email:
                            updatedUser.email,
                        role:
                            updatedUser.role,
                        profileImage:
                            updatedUser.profileImage ||
                            "",
                    })
                );
            }


            setSuccess(
                "Profile image updated successfully."
            );

        } catch (error) {

            console.error(
                "Failed to upload profile image:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to upload profile image."
            );

        } finally {

            setUploadingImage(false);

            event.target.value = "";
        }
    };


    if (loading) {

        return (
            <LoadingState
                title="Loading profile"
                message="We're retrieving your profile information."
            />
        );
    }


    if (!user) {

        return (
            <div className="profile-page">
                <div className="profile-state-card">
                    <UserRound size={30} />

                    <h2>
                        Profile unavailable
                    </h2>

                    <p>
                        {error ||
                            "We couldn't load your profile."}
                    </p>
                </div>
            </div>
        );
    }


    const imageUrl = user.profileImage || "";

    return (
        <div className="profile-page">

            <div className="profile-page-header">

                <div>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage your personal information
                        and profile photo.
                    </p>
                </div>

                {!editing && (
                    <button
                        type="button"
                        className="profile-edit-button"
                        onClick={handleEdit}
                    >
                        <Edit3 size={17} />

                        Edit Profile
                    </button>
                )}

            </div>


            {error && (
                <div className="profile-alert profile-alert-error">
                    <X size={17} />

                    <span>
                        {error}
                    </span>
                </div>
            )}


            {success && (
                <div className="profile-alert profile-alert-success">
                    <Check size={17} />

                    <span>
                        {success}
                    </span>
                </div>
            )}


            <section className="profile-hero-card">

                <div className="profile-avatar-section">

                    <div className="profile-avatar">

                        {imageUrl ? (

                            <img
                                src={imageUrl}
                                alt={`${user.name}'s profile`}
                            />

                        ) : (

                            <span>
                                {getInitials(
                                    user.name
                                )}
                            </span>
                        )}

                        {uploadingImage && (
                            <div className="profile-avatar-loading">
                                Uploading...
                            </div>
                        )}

                    </div>


                    <div className="profile-avatar-content">

                        <h2>
                            {user.name}
                        </h2>

                        <p>
                            {user.email}
                        </p>

                        <span className="profile-role-badge">
                            {user.role === "PROVIDER"
                                ? "Service Provider"
                                : user.role === "ADMIN"
                                    ? "Administrator"
                                    : "Customer"}
                        </span>

                    </div>


                    <div className="profile-photo-action">

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={
                                handleImageSelect
                            }
                            hidden
                        />

                        <button
                            type="button"
                            className="profile-photo-button"
                            disabled={
                                uploadingImage
                            }
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            <Camera size={17} />

                            {uploadingImage
                                ? "Uploading..."
                                : "Change photo"}
                        </button>

                        <span>
                            JPG, PNG, WEBP or GIF · Max 5 MB
                        </span>

                    </div>

                </div>

            </section>


            <form
                className="profile-content"
                onSubmit={handleSave}
            >

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div>
                            <h2>
                                Personal information
                            </h2>

                            <p>
                                Your basic account information.
                            </p>
                        </div>

                        <UserRound size={20} />

                    </div>


                    <div className="profile-form-grid">

                        <div className="profile-field">

                            <label htmlFor="name">
                                Full name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                                required
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="profile-input-with-icon">

                                <Mail size={17} />

                                <input
                                    id="email"
                                    type="email"
                                    value={
                                        user.email || ""
                                    }
                                    disabled
                                />

                            </div>

                            <small>
                                Email address cannot be changed here.
                            </small>

                        </div>


                        <div className="profile-field">

                            <label htmlFor="phone">
                                Phone number
                            </label>

                            <div className="profile-input-with-icon">

                                <Phone size={17} />

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="Enter your phone number"
                                />

                            </div>

                        </div>

                    </div>

                </section>


                <section className="profile-card">

                    <div className="profile-card-header">

                        <div>
                            <h2>
                                Address
                            </h2>

                            <p>
                                Keep your primary address up to date.
                            </p>
                        </div>

                        <MapPin size={20} />

                    </div>


                    <div className="profile-form-grid">

                        <div className="profile-field profile-field-full">

                            <label htmlFor="addressLine1">
                                Address line 1
                            </label>

                            <input
                                id="addressLine1"
                                name="addressLine1"
                                type="text"
                                value={
                                    form.addressLine1
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                                placeholder="House number, street name"
                            />

                        </div>


                        <div className="profile-field profile-field-full">

                            <label htmlFor="addressLine2">
                                Address line 2
                            </label>

                            <input
                                id="addressLine2"
                                name="addressLine2"
                                type="text"
                                value={
                                    form.addressLine2
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                                placeholder="Apartment, landmark, etc."
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="city">
                                City
                            </label>

                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={
                                    form.city
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="state">
                                State
                            </label>

                            <input
                                id="state"
                                name="state"
                                type="text"
                                value={
                                    form.state
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="postalCode">
                                Postal code
                            </label>

                            <input
                                id="postalCode"
                                name="postalCode"
                                type="text"
                                value={
                                    form.postalCode
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                            />

                        </div>


                        <div className="profile-field">

                            <label htmlFor="country">
                                Country
                            </label>

                            <input
                                id="country"
                                name="country"
                                type="text"
                                value={
                                    form.country
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={!editing}
                            />

                        </div>

                    </div>

                </section>


                {editing && (

                    <div className="profile-form-actions">

                        <button
                            type="button"
                            className="profile-cancel-button"
                            onClick={
                                handleCancel
                            }
                            disabled={saving}
                        >
                            <X size={17} />

                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >
                            <Save size={17} />

                            {saving
                                ? "Saving..."
                                : "Save changes"}
                        </button>

                    </div>

                )}

            </form>

        </div>
    );
};


export default Profile;