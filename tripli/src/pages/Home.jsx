import { Container, Card} from 'react-bootstrap';

function Home() {
    return (
        <Container>
            <Card className="text-center py-5">
                <Card.Body>
                    <h1>Welcome to Tripli!</h1>
                </Card.Body>
            </Card>
        </Container>
    );
}
export default Home;