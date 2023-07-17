import { Link } from "@remix-run/react";
import NavBar from "../components/NavBar";
const Dashboard = () => {
    return (
        <div>
            <NavBar/>
            <br />
            <div>
                <h1 className="text-7xl">Dashboard</h1>
            </div>
        </div>
    );
}

export default Dashboard;