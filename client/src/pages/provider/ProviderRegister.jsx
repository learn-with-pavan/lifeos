import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    Wrench,
} from "lucide-react";

import {
    useState,
} from "react";

import {
    registerProviderUser,
    loginUser,
} from "../../services/authService";

import {
    useToast,
} from "../../context/ToastContext";


const ProviderRegister = () => {

    const navigate =
        useNavigate();

    const toast =
        useToast();


    const [
        formData,
        setFormData,
    ] = useState({

        name: "",
        businessName: "",
        email: "",
        password: "",
        confirmPassword: "",

    });


    const [
        loading,
        setLoading,
    ] = useState(false);


    const handleChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setFormData(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        };


    const handleSubmit =
        async (event) => {

            event.preventDefault();


            if (
                formData.password !==
                formData.confirmPassword
            ) {

                toast.warning(
                    "Passwords do not match"
                );

                return;
            }


            try {

                setLoading(true);


                await registerProviderUser({

                    name:
                        formData.name,

                    businessName:
                        formData.businessName,

                    email:
                        formData.email,

                    password:
                        formData.password,

                });


                const loginData =
                    await loginUser({

                        email:
                            formData.email,

                        password:
                            formData.password,

                    });


                localStorage.setItem(
                    "token",
                    loginData.token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        loginData.user
                    )
                );


                toast.success(
                    "Provider account created successfully"
                );


                navigate(
                    "/provider/dashboard",
                    {
                        replace: true,
                    }
                );

            } catch (error) {

                toast.error(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                    "Provider registration failed"
                );

            } finally {

                setLoading(false);

            }
        };


    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-brand">

                    <div className="brand-icon">

                        <Wrench
                            size={24}
                        />

                    </div>


                    <div>

                        <h1>
                            LifeOS
                        </h1>

                        <p>
                            Provider Portal
                        </p>

                    </div>

                </div>


                <div className="auth-heading">

                    <h2>
                        Create your provider account
                    </h2>

                    <p>
                        Start offering your services
                        through LifeOS.
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="form-group">

                        <label htmlFor="name">
                            Full name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            value={
                                formData.name
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="businessName">
                            Business name
                        </label>

                        <input
                            id="businessName"
                            name="businessName"
                            type="text"
                            placeholder="Enter your business name"
                            value={
                                formData.businessName
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={
                                formData.password
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={
                                formData.confirmPassword
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating provider account..."
                            : "Create provider account"}

                    </button>

                </form>


                <div className="auth-footer">

                    <p>

                        Already have an account?{" "}

                        <Link to="/login">
                            Sign in
                        </Link>

                    </p>


                    <p>

                        Looking for a customer account?{" "}

                        <Link to="/register">
                            Create customer account
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
};


export default ProviderRegister;