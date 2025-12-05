import React from 'react'

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");     // delete JWT token
        localStorage.removeItem("userId");    // if you stored user id
        window.location.href = "/login";      // redirect to login page
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
            Logout
        </button>

    )
}

export default Logout