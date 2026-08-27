import {
    BarChart3,
    Home as HomeIcon,
    Package,
    Wrench,
    IndianRupee,
    TrendingUp,
    CalendarDays,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getInsights,
} from "../services/insightsService";

import "../styles/insights.css";


function Insights() {

    const navigate = useNavigate();

    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* -------------------------------- */
    /* LOAD INSIGHTS */
    /* -------------------------------- */

    const loadInsights = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getInsights();

            setInsights(response?.data || {});

        } catch (error) {

            console.error(
                "Failed to load insights:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load insights."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadInsights();
    }, []);


    /* -------------------------------- */
    /* SAFE VALUE FORMATTER */
    /* -------------------------------- */

    const formatValue = (
        value,
        fallback = "—"
    ) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return fallback;
        }

        if (typeof value === "string" ||
            typeof value === "number") {
            return String(value);
        }

        if (typeof value === "object") {

            /*
             * Home/address object
             */

            const addressParts = [
                value.line1,
                value.line2,
                value.city,
                value.state,
                value.pincode,
            ].filter(Boolean);

            if (addressParts.length) {
                return addressParts.join(", ");
            }

            /*
             * Populated MongoDB reference
             */

            return (
                value.name ||
                value.title ||
                value.label ||
                fallback
            );
        }

        return fallback;
    };


    /* -------------------------------- */
    /* CURRENCY */
    /* -------------------------------- */

    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(
            Number(amount || 0)
        );
    };


    /* -------------------------------- */
    /* MONTH */
    /* -------------------------------- */

    const formatMonth = (month) => {

        if (!month) {
            return "—";
        }

        const [year, monthNumber] =
            String(month).split("-");

        if (!year || !monthNumber) {
            return String(month);
        }

        return new Date(
            Number(year),
            Number(monthNumber) - 1
        ).toLocaleDateString(
            "en-IN",
            {
                month: "short",
                year: "numeric",
            }
        );
    };


    /* -------------------------------- */
    /* DATA */
    /* -------------------------------- */

    const overview =
        insights?.overview || {};

    const spendingByCategory =
        Array.isArray(insights?.spendingByCategory)
            ? insights.spendingByCategory
            : [];

    const spendingByHome =
        Array.isArray(insights?.spendingByHome)
            ? insights.spendingByHome
            : [];

    const monthlySpending =
        Array.isArray(insights?.monthlySpending)
            ? insights.monthlySpending
            : [];

    const assetOwnership =
        Array.isArray(insights?.assetOwnership)
            ? insights.assetOwnership
            : [];

    const upcoming =
        insights?.upcoming || {};


    /* -------------------------------- */
    /* MAX VALUES */
    /* -------------------------------- */

    const maxCategoryAmount = useMemo(
        () =>
            Math.max(
                ...spendingByCategory.map(
                    (item) =>
                        Number(item?.amount || 0)
                ),
                1
            ),
        [spendingByCategory]
    );


    const maxHomeAmount = useMemo(
        () =>
            Math.max(
                ...spendingByHome.map(
                    (item) =>
                        Number(item?.amount || 0)
                ),
                1
            ),
        [spendingByHome]
    );


    const maxMonthlyAmount = useMemo(
        () =>
            Math.max(
                ...monthlySpending.map(
                    (item) =>
                        Number(item?.amount || 0)
                ),
                1
            ),
        [monthlySpending]
    );


    /* -------------------------------- */
    /* TOTAL DATA */
    /* -------------------------------- */

    const hasData =
        Number(overview.totalAssetValue || 0) > 0 ||
        Number(overview.totalServiceCost || 0) > 0 ||
        spendingByCategory.length > 0 ||
        spendingByHome.length > 0 ||
        monthlySpending.length > 0 ||
        assetOwnership.length > 0;


    return (

        <div className="insights-page">

            {/* -------------------------------- */}
            {/* HEADER */}
            {/* -------------------------------- */}

            <div className="page-title-row">

                <div>

                    <div className="insights-title">

                        <div className="insights-title-icon">
                            <BarChart3 size={22} />
                        </div>

                        <div>

                            <h1>
                                Insights
                            </h1>

                            <p>
                                Understand what you own,
                                what you spend, and where
                                your money goes.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="insights-refresh-button"
                    onClick={loadInsights}
                    disabled={loading}
                    title="Refresh insights"
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "insights-refresh-icon"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* -------------------------------- */}
            {/* ERROR */}
            {/* -------------------------------- */}

            {error && (

                <div className="insights-error">

                    <div>

                        <strong>
                            Unable to load insights
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={loadInsights}
                    >
                        Try again
                    </button>

                </div>

            )}


            {/* -------------------------------- */}
            {/* OVERVIEW */}
            {/* -------------------------------- */}

            <div className="insights-overview-grid">

                {/* Asset Value */}

                <div className="insight-stat-card">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <Package size={19} />
                        </div>

                        <span>
                            Asset Value
                        </span>

                    </div>

                    <h2>
                        {loading
                            ? "..."
                            : formatCurrency(
                                overview.totalAssetValue
                            )}
                    </h2>

                    <p>
                        Total purchase value
                    </p>

                </div>


                {/* Service Spending */}

                <div className="insight-stat-card">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <Wrench size={19} />
                        </div>

                        <span>
                            Service Spending
                        </span>

                    </div>

                    <h2>
                        {loading
                            ? "..."
                            : formatCurrency(
                                overview.totalServiceCost
                            )}
                    </h2>

                    <p>
                        Money spent on services
                    </p>

                </div>


                {/* Maintenance */}

                <div className="insight-stat-card">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <CalendarDays size={19} />
                        </div>

                        <span>
                            Upcoming Maintenance
                        </span>

                    </div>

                    <h2>
                        {loading
                            ? "..."
                            : Number(
                                upcoming.maintenanceCount || 0
                            )}
                    </h2>

                    <p>
                        Estimated cost{" "}
                        {loading
                            ? "..."
                            : formatCurrency(
                                upcoming.estimatedCost
                            )}
                    </p>

                </div>


                {/* Ownership */}

                <div className="insight-stat-card insight-stat-card-primary">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <TrendingUp size={19} />
                        </div>

                        <span>
                            Ownership Cost
                        </span>

                    </div>

                    <h2>
                        {loading
                            ? "..."
                            : formatCurrency(
                                overview.totalOwnershipCost
                            )}
                    </h2>

                    <p>
                        Purchase + service costs
                    </p>

                </div>

            </div>


            {/* -------------------------------- */}
            {/* NO DATA */}
            {/* -------------------------------- */}

            {!loading &&
                !error &&
                !hasData && (

                    <div className="insights-no-data">

                        <div className="insights-no-data-icon">
                            <BarChart3 size={30} />
                        </div>

                        <h2>
                            Your insights will appear here
                        </h2>

                        <p>
                            Add assets, homes, and service
                            records to start seeing your
                            ownership and spending insights.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                                navigate("/assets")
                            }
                        >
                            Add an asset
                            <ArrowRight size={16} />
                        </button>

                    </div>
                )}


            {/* -------------------------------- */}
            {/* ANALYTICS */}
            {/* -------------------------------- */}

            {(loading || hasData) && (

                <div className="insights-grid">


                    {/* ================================= */}
                    {/* SPENDING BY CATEGORY */}
                    {/* ================================= */}

                    <section className="insight-panel">

                        <div className="insight-panel-header">

                            <div>

                                <h2>
                                    Spending by category
                                </h2>

                                <p>
                                    Where most of your
                                    ownership spending goes.
                                </p>

                            </div>

                            <div className="insight-panel-icon">
                                <BarChart3 size={19} />
                            </div>

                        </div>


                        {loading ? (

                            <div className="insight-loading">

                                <div className="insight-loading-bar" />
                                <div className="insight-loading-bar" />
                                <div className="insight-loading-bar" />

                            </div>

                        ) : spendingByCategory.length === 0 ? (

                            <div className="insight-empty">

                                <Package size={24} />

                                <p>
                                    No spending data yet.
                                </p>

                            </div>

                        ) : (

                            <div className="insight-bars">

                                {spendingByCategory.map(
                                    (item, index) => {

                                        const amount =
                                            Number(
                                                item?.amount || 0
                                            );

                                        const percentage =
                                            Math.min(
                                                (
                                                    amount /
                                                    maxCategoryAmount
                                                ) * 100,
                                                100
                                            );

                                        return (

                                            <div
                                                className="insight-bar-item"
                                                key={
                                                    `${formatValue(
                                                        item?.category,
                                                        "category"
                                                    )}-${index}`
                                                }
                                            >

                                                <div className="insight-bar-label">

                                                    <span>
                                                        {formatValue(
                                                            item?.category,
                                                            "Other"
                                                        )}
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            amount
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="insight-bar-track">

                                                    <div
                                                        className="insight-bar-fill"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* ================================= */}
                    {/* SPENDING BY HOME */}
                    {/* ================================= */}

                    <section className="insight-panel">

                        <div className="insight-panel-header">

                            <div>

                                <h2>
                                    Spending by home
                                </h2>

                                <p>
                                    Ownership cost across
                                    your homes.
                                </p>

                            </div>

                            <div className="insight-panel-icon">
                                <HomeIcon size={19} />
                            </div>

                        </div>


                        {loading ? (

                            <div className="insight-loading">

                                <div className="insight-loading-bar" />
                                <div className="insight-loading-bar" />
                                <div className="insight-loading-bar" />

                            </div>

                        ) : spendingByHome.length === 0 ? (

                            <div className="insight-empty">

                                <HomeIcon size={24} />

                                <p>
                                    No home spending data yet.
                                </p>

                            </div>

                        ) : (

                            <div className="insight-bars">

                                {spendingByHome.map(
                                    (item, index) => {

                                        const amount =
                                            Number(
                                                item?.amount || 0
                                            );

                                        const percentage =
                                            Math.min(
                                                (
                                                    amount /
                                                    maxHomeAmount
                                                ) * 100,
                                                100
                                            );

                                        return (

                                            <div
                                                className="insight-bar-item"
                                                key={
                                                    `${formatValue(
                                                        item?.home,
                                                        "home"
                                                    )}-${index}`
                                                }
                                            >

                                                <div className="insight-bar-label">

                                                    <span>
                                                        {formatValue(
                                                            item?.home,
                                                            "Unassigned"
                                                        )}
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            amount
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="insight-bar-track">

                                                    <div
                                                        className="insight-bar-fill"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* ================================= */}
                    {/* MONTHLY SPENDING */}
                    {/* ================================= */}

                    <section className="insight-panel insight-panel-wide">

                        <div className="insight-panel-header">

                            <div>

                                <h2>
                                    Monthly spending
                                </h2>

                                <p>
                                    Purchase and service
                                    spending over time.
                                </p>

                            </div>

                            <div className="insight-panel-icon">
                                <IndianRupee size={19} />
                            </div>

                        </div>


                        {loading ? (

                            <div className="insight-loading insight-loading-chart">

                                <div className="insight-chart-skeleton">
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>

                            </div>

                        ) : monthlySpending.length === 0 ? (

                            <div className="insight-empty">

                                <TrendingUp size={24} />

                                <p>
                                    No monthly spending data yet.
                                </p>

                            </div>

                        ) : (

                            <div className="monthly-spending">

                                {monthlySpending.map(
                                    (item, index) => {

                                        const amount =
                                            Number(
                                                item?.amount || 0
                                            );

                                        const percentage =
                                            Math.min(
                                                (
                                                    amount /
                                                    maxMonthlyAmount
                                                ) * 100,
                                                100
                                            );

                                        return (

                                            <div
                                                className="monthly-item"
                                                key={
                                                    `${item?.month}-${index}`
                                                }
                                            >

                                                <div className="monthly-bar-area">

                                                    <div
                                                        className="monthly-bar"
                                                        style={{
                                                            height: `${Math.max(
                                                                percentage,
                                                                5
                                                            )}%`,
                                                        }}
                                                        title={formatCurrency(
                                                            amount
                                                        )}
                                                    />

                                                </div>

                                                <strong>
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </strong>

                                                <span>
                                                    {formatMonth(
                                                        item?.month
                                                    )}
                                                </span>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* ================================= */}
                    {/* ASSET OWNERSHIP */}
                    {/* ================================= */}

                    <section className="insight-panel insight-panel-wide">

                        <div className="insight-panel-header">

                            <div>

                                <h2>
                                    Asset ownership
                                </h2>

                                <p>
                                    See which assets have
                                    the highest total cost.
                                </p>

                            </div>

                            <div className="insight-panel-icon">
                                <Package size={19} />
                            </div>

                        </div>


                        {loading ? (

                            <div className="insight-loading">

                                <div className="insight-loading-row" />
                                <div className="insight-loading-row" />
                                <div className="insight-loading-row" />

                            </div>

                        ) : assetOwnership.length === 0 ? (

                            <div className="insight-empty">

                                <Package size={24} />

                                <p>
                                    Add assets to see
                                    ownership costs.
                                </p>

                            </div>

                        ) : (

                            <div className="asset-ownership-list">

                                {assetOwnership
                                    .slice(0, 10)
                                    .map(
                                        (asset, index) => {

                                            const assetName =
                                                formatValue(
                                                    asset?.asset,
                                                    "Unnamed asset"
                                                );

                                            const category =
                                                formatValue(
                                                    asset?.category,
                                                    "Other"
                                                );

                                            const home =
                                                formatValue(
                                                    asset?.home,
                                                    "No home"
                                                );

                                            return (

                                                <button
                                                    type="button"
                                                    className="asset-ownership-row"
                                                    key={
                                                        asset?.assetId ||
                                                        `${assetName}-${index}`
                                                    }
                                                    onClick={() =>
                                                        asset?.assetId &&
                                                        navigate(
                                                            `/assets/${asset.assetId}`
                                                        )
                                                    }
                                                >

                                                    <div className="asset-ownership-main">

                                                        <div className="asset-ownership-icon">
                                                            <Package size={18} />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {assetName}
                                                            </strong>

                                                            <p>
                                                                {category}
                                                                {" · "}
                                                                {home}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="asset-ownership-cost">

                                                        <strong>
                                                            {formatCurrency(
                                                                asset?.totalCost
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {Number(
                                                                asset?.serviceCount || 0
                                                            )}{" "}
                                                            service
                                                            {Number(
                                                                asset?.serviceCount || 0
                                                            ) === 1
                                                                ? ""
                                                                : "s"}
                                                        </span>

                                                    </div>


                                                    <ArrowRight
                                                        size={16}
                                                        className="asset-ownership-arrow"
                                                    />

                                                </button>

                                            );

                                        }
                                    )}

                            </div>

                        )}

                    </section>

                </div>
            )}

        </div>
    );
}


export default Insights;