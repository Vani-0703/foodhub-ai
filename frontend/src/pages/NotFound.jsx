import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-7xl font-extrabold text-primary-500">404</h1>
    <p className="text-gray-500 mt-4 mb-6">Looks like this page got delivered to the wrong address.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
