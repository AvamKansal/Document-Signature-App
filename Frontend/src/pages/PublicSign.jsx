import { useParams } from "react-router-dom";

function PublicSign() {
  const { token } = useParams();

  return (
    <div>
      <h1>Public Signing Page</h1>
      <p>Token: {token}</p>
    </div>
  );
}

export default PublicSign;