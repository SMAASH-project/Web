import AccountMenu from "./AccountMenu";
import { Label } from "@radix-ui/react-dropdown-menu";

const Navbar = () => {

    return (
        <nav className="bg-linear-to-b from-gray-700 to-gray-500 absolute top-0 left-0 right-0 flex justify-between items-center p-4 max-w-full w-full border-b-2 [border-image:linear-gradient(to_right,var(--color-green-400),var(--color-green-600))_1]">
            <div className="navbar-left">
            </div>
            <div className="navbar-center">
                <ul className="nav-links list-none flex m-0 p-0 gap-20">
                    <li className="m-4">
                        <Label>About Us</Label>
                    </li>
                    <li className="m-4">
                        <Label>Gallery</Label>
                    </li>
                    <li className="m-4">
                        <Label>Releases</Label>
                    </li>
                    <li className="m-4">
                        <Label>Webstore</Label>
                    </li>
                    <li className="m-4">
                        <Label>News</Label>
                    </li>
                </ul>
            </div>
            <div className="flex items-center gap-4">
                <Label>Logged in as {}</Label>
                <AccountMenu />
            </div>
        </nav>
    );
};

export default Navbar