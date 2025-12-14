import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  Container, Row, Col, Card, Button, Alert, Spinner, ListGroup, Form,
  InputGroup, Badge, Tab, Tabs
} from 'react-bootstrap';
import { 
  GET_USER,
  GET_FRIENDS,
  GET_FRIEND_REQUESTS,
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
  SEARCH_USERS
} from '../queries.js';

// helper funcs

const renderUserAvatar = (user, bgColor = 'primary') => (
    <div 
        className={`bg-${bgColor} text-white rounded-circle d-flex align-items-center justify-content-center me-3`}
    >
        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
    </div>
);

const renderUserInfo = (user) => (
    <>
        <h5 className="mb-1">
            {user.firstName} {user.lastName}
        </h5>
        <p className="text-muted mb-0">@{user.username}</p>
    </>
);

// tab components - too lazy to move to another file

const CurrentFriendsTab = ({ friends, onRemoveFriend }) => {
    return (
        <Card className="shadow-sm">
            <Card.Body>
                <h3 className="mb-4">Current Friends ({friends.length})</h3>
                
                {friends.length === 0 ? (
                    <Alert variant="info">
                        <p className="mb-0">You don't have any friends yet. Add some friends to get started!</p>
                    </Alert>
                ) : (
                    <ListGroup variant="flush">
                        {friends.map((friend) => (
                            <ListGroup.Item key={friend.id} className="py-3">
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <div className="d-flex align-items-center">
                                            {renderUserAvatar(friend, 'primary')}
                                            <div>
                                                {renderUserInfo(friend)}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-md-end mt-2 mt-md-0">
                                        <div className="d-flex gap-2 justify-content-md-end">
                                            <Link 
                                                to={`/profile/${friend.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                View Profile
                                            </Link>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => onRemoveFriend(friend.id)}
                                            >
                                                Remove Friend
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

const FriendRequestsTab = ({ friendRequests, onAcceptRequest, onRejectRequest }) => {
    return (
        <Card className="shadow-sm">
            <Card.Body>
                <h3 className="mb-4">Pending Friend Requests ({friendRequests.length})</h3>
                
                {friendRequests.length === 0 ? (
                    <Alert variant="info">
                        <p className="mb-0">You don't have any pending friend requests.</p>
                    </Alert>
                ) : (
                    <ListGroup variant="flush">
                        {friendRequests.map((request) => (
                            <ListGroup.Item key={request.id} className="py-3">
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <div className="d-flex align-items-center">
                                            {renderUserAvatar(request, 'secondary')}
                                            <div>
                                                {renderUserInfo(request)}
                                                <Badge bg="warning" className="mt-1">
                                                    Pending Request
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-md-end mt-2 mt-md-0">
                                        <div className="d-flex gap-2 justify-content-md-end">
                                            <Link 
                                                to={`/profile/${request.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                View Profile
                                            </Link>
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                onClick={() => onAcceptRequest(request.id)}
                                            >
                                                Accept
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => onRejectRequest(request.id)}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

const AddFriendTab = ({ friendUsername, setFriendUsername, onAddFriend,setErrorMessage }) => {
    return (
        <Card className="shadow-sm">
            <Card.Body>
                <h3 className="mb-4">Add Friend by Username</h3>
                
                <Form onSubmit={onAddFriend}>
                    <Form.Group className="mb-3">
                        <Form.Label>Enter Username</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Enter username to add as friend"
                                value={friendUsername}
                                onChange={(e) => {
                                    setFriendUsername(e.target.value);
                                    setErrorMessage(null);
                                }}
                                required
                            />
                            <Button type="submit" variant="primary">
                                Send Request
                            </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Enter the exact username of the person you want to add as a friend.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
    );
};

const SearchUsersTab = ({ searchQuery, setSearchQuery, searchResults, searchLoading, onSearchUsers, setErrorMessage,
    setFriendUsername, setActiveTab }) => {
    return (
        <Card className="shadow-sm">
            <Card.Body>
                <h3 className="mb-4">Search Users</h3>
                
                <Form.Group className="mb-4">
                    <Form.Label>Search by username or name</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search for users..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setErrorMessage(null);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && onSearchUsers()}
                        />
                        <Button 
                            variant="outline-secondary"
                            onClick={onSearchUsers}
                            disabled={searchLoading}
                        >
                            {searchLoading ? (
                                <Spinner size="sm" animation="border" />
                            ) : (
                                'Search'
                            )}
                        </Button>
                    </InputGroup>
                </Form.Group>

                {searchResults.length > 0 ? (
                    <ListGroup variant="flush">
                        {searchResults.map((result) => (
                            <ListGroup.Item key={result.id} className="py-3">
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <div className="d-flex align-items-center">
                                            {renderUserAvatar(result, 'info')}
                                            <div>
                                                {renderUserInfo(result)}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-md-end mt-2 mt-md-0">
                                        <div className="d-flex gap-2 justify-content-md-end">
                                            <Link 
                                                to={`/profile/${result.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                View Profile
                                            </Link>
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={() => {
                                                    setFriendUsername(result.username);
                                                    setActiveTab('add-friend');
                                                }}
                                            >
                                                Add Friend
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : searchQuery && !searchLoading ? (
                    <Alert variant="info">
                        <p className="mb-0">No users found matching "{searchQuery}". Try a different search term.</p>
                    </Alert>
                ) : null}
            </Card.Body>
        </Card>
    );
};

function Friends() {
    const userId = localStorage.getItem('userId');
    const [activeTab, setActiveTab] = useState('current-friends');
    const [friendUsername, setFriendUsername] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    //make sure user is logged in before messing with anything
    if (!userId) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <Alert.Heading>Log In</Alert.Heading>
                    <p>You need to be logged in to view and manage friends.</p>
                    <Link to="/login">Go to Login</Link>
                </Alert>
            </Container>
        );
    }



    // get current user info
    const { loading: userLoading, error: userError, data: userData } = useQuery(GET_USER, {
        variables: { id: userId },
        skip: !userId
    });

    //i would like to have a conversation with prof hill on why apollo's caching was never mentioned in slides
    //if it was...nvm...serv

    // get the users current friends
    const { loading: friendsLoading, error: friendsError, data: friendsData, refetch: refetchFriends} = useQuery(
        GET_FRIENDS, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'network-only'
    });

    // get their friend requests (aka made TO them)
    const { loading: requestsLoading, error: requestsError, data: requestsData, refetch: refetchRequests} = useQuery(
        GET_FRIEND_REQUESTS, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'network-only'
    });

    // Mutations
    const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST, {
        onCompleted: () => {
            setFriendUsername('');
            setErrorMessage(null);
            setSuccessMessage('Friend request sent successfully!');
            refetchRequests();
            setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error) => {
            setErrorMessage(error.message);
            setSuccessMessage(null);
        }
    });

    const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST, {
        onCompleted: () => {
            setErrorMessage(null);
            setSuccessMessage('Friend request accepted!');
            refetchFriends();
            refetchRequests();
            setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error) => {
            setErrorMessage(error.message);
            setSuccessMessage(null);
        }
    });

    const [rejectFriendRequest] = useMutation(REJECT_FRIEND_REQUEST, {
        onCompleted: () => {
            setErrorMessage(null);
            setSuccessMessage('Friend request rejected.');
            refetchRequests();
            setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error) => {
            setErrorMessage(error.message);
            setSuccessMessage(null);
        }
    });

    const [removeFriend] = useMutation(REMOVE_FRIEND, {
        onCompleted: () => {
            setErrorMessage(null);
            setSuccessMessage('Friend removed successfully.');
            refetchFriends();
            setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error) => {
            setErrorMessage(error.message);
            setSuccessMessage(null);
        }
    });

    // Search for users - used when searching by username
    const { loading: searchUsersLoading, error: searchUsersError, refetch: searchUsers } = useQuery(SEARCH_USERS, {
        variables: { query: searchQuery },
        skip: true,
        onCompleted: (data) => {
            setSearchResults(data?.searchUsers || []);
            setSearchLoading(false);
            setErrorMessage(null);
        },
        onError: (error) => {
            setErrorMessage(error.message);
            setSearchLoading(false);
        }
    });

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!friendUsername.trim()) {
            setErrorMessage('Please enter a username');
            return;
        }

        try {
            await sendFriendRequest({
                variables: {
                    currentUserId: userId,
                    friendUsername: friendUsername.trim()
                }
            });
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleAcceptRequest = async (friendId) => {
        try {
            await acceptFriendRequest({
                variables: {
                    currentUserId: userId,
                    friendId
                }
            });
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectRequest = async (friendId) => {
        try {
            await rejectFriendRequest({
                variables: {
                    currentUserId: userId,
                    friendId
                }
            });
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            await removeFriend({
                variables: {
                    currentUserId: userId,
                    friendId
                }
            });
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    const handleSearchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setErrorMessage('Please enter a search query');
            return;
        }

        setSearchLoading(true);
        setErrorMessage(null);
        try {
            await searchUsers({ query: searchQuery.trim() });
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchLoading(false);
        }
    };

    // Loading
    if (userLoading || friendsLoading || requestsLoading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading friends...</p>
            </Container>
        );
    }

    // Error
    if (userError || friendsError || requestsError) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>Error loading friends data</Alert.Heading>
                    <p>{userError?.message || friendsError?.message || requestsError?.message}</p>
                </Alert>
            </Container>
        );
    }

    const user = userData?.getUser;
    const friends = friendsData?.getFriends || [];
    const friendRequests = requestsData?.getFriendRequests || [];
    
    //combine all le tabs
    const renderTabContent = () => {
        switch (activeTab) {
            case 'current-friends':
                return (
                    <CurrentFriendsTab 
                        friends={friends}
                        onRemoveFriend={handleRemoveFriend}
                    />
                );
            case 'friend-requests':
                return (
                    <FriendRequestsTab 
                        friendRequests={friendRequests}
                        onAcceptRequest={handleAcceptRequest}
                        onRejectRequest={handleRejectRequest}
                    />
                );
            case 'add-friend':
                return (
                    <AddFriendTab 
                        friendUsername={friendUsername}
                        setFriendUsername={setFriendUsername}
                        onAddFriend={handleAddFriend}
                        setErrorMessage={setErrorMessage}
                    />
                );
            case 'search-users':
                return (
                    <SearchUsersTab 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                        onSearchUsers={handleSearchUsers}
                        setErrorMessage={setErrorMessage}
                        setFriendUsername={setFriendUsername}
                        setActiveTab={setActiveTab}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container className="my-4">
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h1 className="mb-3">Friends Management</h1>
                    <p className="text-muted mb-0">
                        Managing friends for <strong>{user?.firstName} {user?.lastName}</strong> (@{user?.username})
                    </p>
                </Card.Body>
            </Card>

            {errorMessage && (
                <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => setErrorMessage(null)}
                    className="mb-4"
                >
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{errorMessage}</p>
                </Alert>
            )}

            {successMessage && (
                <Alert 
                    variant="success" 
                    dismissible 
                    onClose={() => setSuccessMessage(null)}
                    className="mb-4"
                >
                    <Alert.Heading>Success</Alert.Heading>
                    <p>{successMessage}</p>
                </Alert>
            )}

            {/* Tabs as they appear */}
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
            >
                <Tab eventKey="current-friends" title={`Current Friends (${friends.length})`} />
                <Tab eventKey="friend-requests" title={`Friend Requests (${friendRequests.length})`} />
                <Tab eventKey="add-friend" title="Add Friend" />
                <Tab eventKey="search-users" title="Search Users" />
            </Tabs>

            {/* Actual content In the tab */}
            {renderTabContent()}
        </Container>
    );
}

export default Friends;