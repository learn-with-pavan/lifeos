import {
    BarChart3,
    Home as HomeIcon,
    Package,
    Wrench,
    IndianRupee,
    TrendingUp,
    CalendarDays,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    getInsights,
} from "../services/insightsService";

import "../styles/insights.css";

function Insights() {

    const [insights, setInsights] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadInsights = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getInsights();

            setInsights(
                response.data
            );

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


    const formatMonth = (month) => {

        if (!month) {
            return "";
        }

        const [year, monthNumber] =
            month.split("-");

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


    const overview =
        insights?.overview || {};


    const spendingByCategory =
        insights?.spendingByCategory || [];


    const spendingByHome =
        insights?.spendingByHome || [];


    const monthlySpending =
        insights?.monthlySpending || [];


    const assetOwnership =
        insights?.assetOwnership || [];


    const upcoming =
        insights?.upcoming || {};


    const maxCategoryAmount =
        Math.max(
            ...spendingByCategory.map(
                (item) =>
                    Number(item.amount || 0)
            ),
            1
        );


    const maxHomeAmount =
        Math.max(
            ...spendingByHome.map(
                (item) =>
                    Number(item.amount || 0)
            ),
            1
        );


    const maxMonthlyAmount =
        Math.max(
            ...monthlySpending.map(
                (item) =>
                    Number(item.amount || 0)
            ),
            1
        );


    return (
        <div className="insights-page">

            {/* HEADER */}

            <div className="page-title-row">

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


            {/* ERROR */}

            {error && (

                <div className="insights-error">

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={
                            loadInsights
                        }
                    >
                        Try again
                    </button>

                </div>

            )}


            {/* OVERVIEW */}

            <div className="insights-overview-grid">

                <div className="insight-stat-card">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <Package size={20} />
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


                <div className="insight-stat-card">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <Wrench size={20} />
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


                <div className="insight-stat-card">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <CalendarDays size={20} />
                        </div>

                        <span>
                            Upcoming Maintenance
                        </span>

                    </div>

                    <h2>
                        {loading
                            ? "..."
                            : upcoming.maintenanceCount ??
                            0}
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


                <div className="insight-stat-card insight-stat-card-primary">

                    <div className="insight-stat-top">

                        <div className="insight-stat-icon">
                            <TrendingUp size={20} />
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


            {/* ANALYTICS GRID */}

            <div className="insights-grid">


                {/* SPENDING BY CATEGORY */}

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

                        <BarChart3
                            size={20}
                        />

                    </div>


                    {loading ? (

                        <div className="insight-loading">
                            Loading...
                        </div>

                    ) : spendingByCategory.length ===
                        0 ? (

                        <div className="insight-empty">

                            <Package size={24} />

                            <p>
                                No spending data yet.
                            </p>

                        </div>

                    ) : (

                        <div className="insight-bars">

                            {spendingByCategory.map(
                                (item) => {

                                    const percentage =
                                        (
                                            Number(
                                                item.amount
                                            ) /
                                            maxCategoryAmount
                                        ) *
                                        100;

                                    return (

                                        <div
                                            className="insight-bar-item"
                                            key={
                                                item.category
                                            }
                                        >

                                            <div className="insight-bar-label">

                                                <span>
                                                    {
                                                        item.category
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        formatCurrency(
                                                            item.amount
                                                        )
                                                    }
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


                {/* SPENDING BY HOME */}

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

                        <HomeIcon
                            size={20}
                        />

                    </div>


                    {loading ? (

                        <div className="insight-loading">
                            Loading...
                        </div>

                    ) : spendingByHome.length ===
                        0 ? (

                        <div className="insight-empty">

                            <HomeIcon size={24} />

                            <p>
                                No home spending
                                data yet.
                            </p>

                        </div>

                    ) : (

                        <div className="insight-bars">

                            {spendingByHome.map(
                                (item) => {

                                    const percentage =
                                        (
                                            Number(
                                                item.amount
                                            ) /
                                            maxHomeAmount
                                        ) *
                                        100;

                                    return (

                                        <div
                                            className="insight-bar-item"
                                            key={
                                                item.home
                                            }
                                        >

                                            <div className="insight-bar-label">

                                                <span>
                                                    {
                                                        item.home
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        formatCurrency(
                                                            item.amount
                                                        )
                                                    }
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


                {/* MONTHLY SPENDING */}

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

                        <IndianRupee
                            size={20}
                        />

                    </div>


                    {loading ? (

                        <div className="insight-loading">
                            Loading...
                        </div>

                    ) : monthlySpending.length ===
                        0 ? (

                        <div className="insight-empty">

                            <TrendingUp size={24} />

                            <p>
                                No monthly spending
                                data yet.
                            </p>

                        </div>

                    ) : (

                        <div className="monthly-spending">

                            {monthlySpending.map(
                                (item) => {

                                    const percentage =
                                        (
                                            Number(
                                                item.amount
                                            ) /
                                            maxMonthlyAmount
                                        ) *
                                        100;

                                    return (

                                        <div
                                            className="monthly-item"
                                            key={
                                                item.month
                                            }
                                        >

                                            <div className="monthly-bar-area">

                                                <div
                                                    className="monthly-bar"
                                                    style={{
                                                        height: `${Math.max(
                                                            percentage,
                                                            8
                                                        )}%`,
                                                    }}
                                                />

                                            </div>

                                            <strong>
                                                {
                                                    formatCurrency(
                                                        item.amount
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    formatMonth(
                                                        item.month
                                                    )
                                                }
                                            </span>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ASSET OWNERSHIP */}

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

                        <Package
                            size={20}
                        />

                    </div>


                    {loading ? (

                        <div className="insight-loading">
                            Loading...
                        </div>

                    ) : assetOwnership.length ===
                        0 ? (

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
                                    (asset) => (

                                        <div
                                            className="asset-ownership-row"
                                            key={
                                                asset.assetId
                                            }
                                        >

                                            <div className="asset-ownership-main">

                                                <div className="asset-ownership-icon">
                                                    <Package
                                                        size={18}
                                                    />
                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            asset.asset
                                                        }
                                                    </strong>

                                                    <p>
                                                        {
                                                            asset.category
                                                        }

                                                        {" · "}

                                                        {
                                                            asset.home
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="asset-ownership-cost">

                                                <strong>
                                                    {
                                                        formatCurrency(
                                                            asset.totalCost
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        asset.serviceCount
                                                    }{" "}
                                                    service
                                                    {asset.serviceCount ===
                                                        1
                                                        ? ""
                                                        : "s"}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                        </div>

                    )}

                </section>

            </div>

        </div>
    );
}

export default Insights;