import React from "react";
import {Frame} from "./frame/Frame";
import {
	Alert,
	Button,
	Card,
	Accordion,
	Badge,
	Breadcrumb,
	ButtonGroup,
	ButtonToolbar,
	ListGroup,
	CardGroup,
	CardDeck,
	CardColumns,
	Carousel,
	DropdownButton,
	Dropdown,
	InputGroup,
	FormControl,
	Jumbotron,
	Modal,
	Nav,
	NavDropdown,
	Navbar,
	Form,
	Pagination,
	Popover,
	ProgressBar,
	Spinner,
	Tabs,
	Tab,
	Row,
	Col,
	Tooltip,
	Toast,
	Table
} from "react-bootstrap";

export function Bootstrap() {
	return <Frame title="Bootstrap test" sidebar={false}>
		<div className="pb-4">
			<h2>Alerts</h2>
			<div>
				<Alert dismissible>
					<Alert.Heading>Attention!</Alert.Heading>
					This is an alert with a <Alert.Link>link</Alert.Link>
					<Button>There's even a button!</Button>
				</Alert>
			</div>
			<h2>Accordions</h2>
			<div>
				<Accordion>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant="link" eventKey="0">
								Click me!
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey="0">
							<Card.Body>Hello! I'm the body</Card.Body>
						</Accordion.Collapse>
					</Card>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant="link" eventKey="1">
								Click me!
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey="1">
							<Card.Body>Hello! I'm another body</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
			</div>
			<h2>Badges</h2>
			<div>
				<p>Rounded <Badge>Yeah!</Badge></p>
				<p>Pills <Badge pill>Whoo!</Badge></p>
			</div>
			<h1>Breadcrumbs</h1>
			<div>
				<Breadcrumb>
					<Breadcrumb.Item href="/">Home</Breadcrumb.Item>
					<Breadcrumb.Item href="/course/1">Course</Breadcrumb.Item>
					<Breadcrumb.Item active>User</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			<h2>Buttons</h2>
			<div>
				<Button>One Bootstrap button</Button>
				<Button variant="outline-primary">Two Bootstrap button</Button>
				<Button block>Three Bootstrap button</Button>
				<Button disabled>Disabled Bootstrap button</Button>
			</div>
			<h2>Button Groups</h2>
			<div>
				<ButtonGroup>
					<Button>Left</Button>
					<Button>Middle</Button>
					<Button>Right</Button>
				</ButtonGroup>
				<ButtonGroup vertical>
					<Button>Top</Button>
					<Button>Middle</Button>
					<Button>Bottom</Button>
				</ButtonGroup>
				<ButtonToolbar>
					<ButtonGroup className="mr-2">
						<Button>1</Button>
						<Button>2</Button>
						<Button>3</Button>
						<Button>4</Button>
					</ButtonGroup>
					<ButtonGroup className="mr-2">
						<Button>5</Button>
						<Button>6</Button>
						<Button>7</Button>
					</ButtonGroup>
					<ButtonGroup>
						<Button>8</Button>
					</ButtonGroup>
				</ButtonToolbar>
			</div>
			<h2>Cards</h2>
			<div>
				<Card>
					<Card.Img variant="top" src="holder.js/100px180"/>
					<Card.Body>
						<Card.Title>Card Title</Card.Title>
						<Card.Subtitle>Card Subtitle</Card.Subtitle>
						<Card.Text>
							Some quick example text to build on the card title and make up the bulk of the card's content.
						</Card.Text>
						<Button variant="primary">Go somewhere</Button>
					</Card.Body>
				</Card>
				<Card>
					<Card.Header>Featured</Card.Header>
					<Card.Body>
						<Card.Title>Card Title</Card.Title>
						<Card.Text>
							Some quick example text to build on the card title and make up the bulk of the card's content.
						</Card.Text>
					</Card.Body>
					<ListGroup>
						<ListGroup.Item>Cras justo odio</ListGroup.Item>
						<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
						<ListGroup.Item>Vestibulum at eros</ListGroup.Item>
					</ListGroup>
					<Card.Body>
						<Card.Link href="#">Card Link</Card.Link>
						<Card.Link href="#">Another Link</Card.Link>
					</Card.Body>
					<Card.Footer className="text-muted">2 days ago</Card.Footer>
				</Card>
				<Card className="bg-dark text-white">
					<Card.Img src="holder.js/100px270" alt="Card image"/>
					<Card.ImgOverlay>
						<Card.Title>Card title</Card.Title>
						<Card.Text>
							This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
						</Card.Text>
						<Card.Text>Last updated 3 mins ago</Card.Text>
					</Card.ImgOverlay>
				</Card>
				<Card body>This is some text within a card body.</Card>
				<CardGroup>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This card has supporting text below as a natural lead-in to additional content.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This is a wider card with supporting text below as a natural lead-in to
								additional content. This card has even longer content than the first to
								show that equal height action.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
				</CardGroup>
				<CardDeck>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This card has supporting text below as a natural lead-in to additional content.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This is a wider card with supporting text below as a natural lead-in to
								additional content. This card has even longer content than the first to
								show that equal height action.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
				</CardDeck>
				<CardColumns>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title that wraps to a new line</Card.Title>
							<Card.Text>
								This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
							</Card.Text>
						</Card.Body>
					</Card>
					<Card className="p-3">
						<blockquote className="blockquote mb-0 card-body">
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.
							</p>
							<footer className="blockquote-footer">
								<small className="text-muted">
									Someone famous in <cite title="Source Title">Source Title</cite>
								</small>
							</footer>
						</blockquote>
					</Card>
					<Card>
						<Card.Img variant="top" src="holder.js/100px160"/>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This card has supporting text below as a natural lead-in to additional content.
							</Card.Text>
						</Card.Body>
						<Card.Footer>
							<small className="text-muted">Last updated 3 mins ago</small>
						</Card.Footer>
					</Card>
					<Card bg="primary" text="white" className="text-center p-3">
						<blockquote className="blockquote mb-0 card-body">
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
							<footer className="blockquote-footer">
								<small className="text-muted">
									Someone famous in <cite title="Source Title">Source Title</cite>
								</small>
							</footer>
						</blockquote>
					</Card>
					<Card className="text-center">
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This card has supporting text below as a natural lead-in to additional
								content.{" "}
							</Card.Text>
							<Card.Text>
								<small className="text-muted">Last updated 3 mins ago</small>
							</Card.Text>
						</Card.Body>
					</Card>
					<Card>
						<Card.Img src="holder.js/100px160"/>
					</Card>
					<Card className="text-right">
						<blockquote className="blockquote mb-0 card-body">
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
							<footer className="blockquote-footer">
								<small className="text-muted">
									Someone famous in <cite title="Source Title">Source Title</cite>
								</small>
							</footer>
						</blockquote>
					</Card>
					<Card>
						<Card.Body>
							<Card.Title>Card title</Card.Title>
							<Card.Text>
								This is a wider card with supporting text below as a natural lead-in to
								additional content. This card has even longer content than the first to
								show that equal height action.
							</Card.Text>
							<Card.Text>
								<small className="text-muted">Last updated 3 mins ago</small>
							</Card.Text>
						</Card.Body>
					</Card>
				</CardColumns>
			</div>
			<h2>Carousels</h2>
			<div>
				<Carousel>
					<Carousel.Item>
						<img
							className="d-block w-100"
							alt="First slide"
							style={{backgroundColor: "#333333", height: "20rem"}}
						/>
						<Carousel.Caption>
							<h3>First slide label</h3>
							<p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
						</Carousel.Caption>
					</Carousel.Item>
					<Carousel.Item>
						<img
							className="d-block w-100"
							alt="Third slide"
							style={{backgroundColor: "#333333", height: "20rem"}}
						/>
						<Carousel.Caption>
							<h3>Second slide label</h3>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
						</Carousel.Caption>
					</Carousel.Item>
					<Carousel.Item>
						<img
							className="d-block w-100"
							alt="Third slide"
							style={{backgroundColor: "#333333", height: "20rem"}}
						/>
						<Carousel.Caption>
							<h3>Third slide label</h3>
							<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
						</Carousel.Caption>
					</Carousel.Item>
				</Carousel>
			</div>
			<h2>Dropdowns</h2>
			<div>
				<DropdownButton id="1" title="Dropdown">
					<Dropdown.Item eventKey="1">Action</Dropdown.Item>
					<Dropdown.Item eventKey="2">Another action</Dropdown.Item>
					<Dropdown.Item eventKey="3" active>Active Item</Dropdown.Item>
					<Dropdown.Divider/>
					<Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
				</DropdownButton>
			</div>
			<h2>Forms</h2>
			<div>
				<Form>
					<Form.Group controlId="formBasicEmail">
						<Form.Label>Email address</Form.Label>
						<Form.Control type="email" placeholder="Enter email"/>
						<Form.Text className="text-muted">
							We'll never share your email with anyone else.
						</Form.Text>
					</Form.Group>
					<Form.Group controlId="formBasicPassword">
						<Form.Label>Password</Form.Label>
						<Form.Control type="password" placeholder="Password"/>
					</Form.Group>
					<Form.Group controlId="formBasicCheckbox">
						<Form.Check type="checkbox" label="Check me out"/>
					</Form.Group>
					<Form.Group controlId="exampleForm.ControlInput1">
						<Form.Label>Email address</Form.Label>
						<Form.Control type="email" placeholder="name@example.com"/>
					</Form.Group>
					<Form.Group controlId="exampleForm.ControlSelect1">
						<Form.Label>Example select</Form.Label>
						<Form.Control as="select">
							<option>1</option>
							<option>2</option>
							<option>3</option>
							<option>4</option>
							<option>5</option>
						</Form.Control>
					</Form.Group>
					<Form.Group controlId="exampleForm.ControlSelect2">
						<Form.Label>Example multiple select</Form.Label>
						<Form.Control as="select" multiple>
							<option>1</option>
							<option>2</option>
							<option>3</option>
							<option>4</option>
							<option>5</option>
						</Form.Control>
					</Form.Group>
					<Form.Group controlId="exampleForm.ControlTextarea1">
						<Form.Label>Example textarea</Form.Label>
						<Form.Control as="textarea" rows="3"/>
					</Form.Group>
					<Form.Group controlId="formPlaintextEmail">
						<Form.Control plaintext readOnly defaultValue="email@example.com"/>
					</Form.Group>
					<Form.Group>
						<Form.Check label="Check me"/>
						<Form.Check label="No soap" type="radio"/>
						<Form.Check label="Radio" type="radio"/>
					</Form.Group>
					<Button type="submit">Submit</Button>
				</Form>
			</div>
			<h2>Input Groups</h2>
			<div>
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Text>$</InputGroup.Text>
						<InputGroup.Text>0.00</InputGroup.Text>
					</InputGroup.Prepend>
					<FormControl placeholder="Recipient's name"/>
					<FormControl placeholder="Recipient's email"/>
				</InputGroup>
				<InputGroup>
					<FormControl placeholder="Recipient's name"/>
					<InputGroup.Append>
						<InputGroup.Text>$</InputGroup.Text>
						<InputGroup.Text>0.00</InputGroup.Text>
					</InputGroup.Append>
				</InputGroup>
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Checkbox/>
						<InputGroup.Radio/>
						<InputGroup.Radio/>
					</InputGroup.Prepend>
					<FormControl/>
				</InputGroup>
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Text>With textarea</InputGroup.Text>
					</InputGroup.Prepend>
					<FormControl as="textarea"/>
				</InputGroup>
			</div>
			<h2>Jumbotron</h2>
			<div>
				<Jumbotron fluid>
					<h1>Hello, world!</h1>
					<p>
						This is a simple hero unit, a simple jumbotron-style component for calling
						extra attention to featured content or information.
					</p>
					<p>
						<Button>Learn more</Button>
					</p>
				</Jumbotron>
			</div>
			<h2>List Groups</h2>
			<div>
				<ListGroup>
					<ListGroup.Item>Cras justo odio</ListGroup.Item>
					<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
					<ListGroup.Item disabled>Morbi leo risus</ListGroup.Item>
					<ListGroup.Item action>Porta ac consectetur ac</ListGroup.Item>
					<ListGroup.Item active>Vestibulum at eros</ListGroup.Item>
				</ListGroup>
				<ListGroup variant="flush">
					<ListGroup.Item>Cras justo odio</ListGroup.Item>
					<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
					<ListGroup.Item>Morbi leo risus</ListGroup.Item>
					<ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
					<ListGroup.Item>Vestibulum at eros</ListGroup.Item>
				</ListGroup>
			</div>
			<h2>Modals</h2>
			<div>
				<Modal.Dialog>
					<Modal.Header closeButton><Modal.Title>Modal title</Modal.Title></Modal.Header>
					<Modal.Body><p>Modal body text goes here.</p></Modal.Body>
					<Modal.Footer>
						<Button>Close</Button>
						<Button>Save changes</Button>
					</Modal.Footer>
				</Modal.Dialog>
			</div>
			<h2>Navs</h2>
			<div>
				<Nav>
					<Nav.Item>
						<Nav.Link>NavLink 1 content</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link>NavLink 2 content</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link disabled>NavLink 3 content</Nav.Link>
					</Nav.Item>
					<NavDropdown id="1" title="dropdown">
						<NavDropdown.Item>Action</NavDropdown.Item>
						<NavDropdown.Item>Another action</NavDropdown.Item>
						<NavDropdown.Item>Something else here</NavDropdown.Item>
						<NavDropdown.Divider/>
						<NavDropdown.Item>Separated link</NavDropdown.Item>
					</NavDropdown>
					<Nav defaultActiveKey="/home" className="flex-column">
						<Nav.Link href="/home">Active</Nav.Link>
						<Nav.Link eventKey="link-1">Link</Nav.Link>
						<Nav.Link eventKey="link-2">Link</Nav.Link>
						<Nav.Link eventKey="disabled" disabled>Disabled</Nav.Link>
					</Nav>
					<Nav variant="tabs" defaultActiveKey="/home">
						<Nav.Item>
							<Nav.Link href="/home">Active</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="link-1">Option 2</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="disabled" disabled>Disabled</Nav.Link>
						</Nav.Item>
					</Nav>
					<Nav variant="pills" defaultActiveKey="/home">
						<Nav.Item>
							<Nav.Link href="/home">Active</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="link-1">Option 2</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="disabled" disabled>Disabled</Nav.Link>
						</Nav.Item>
					</Nav>
				</Nav>
			</div>
			<h2>Navbars</h2>
			<div style={{overflow: "auto"}}>
				<Navbar>
					<Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
					<Navbar.Toggle/>
					<Navbar.Collapse id="header">
						<Nav className="mr-auto">
							<Nav.Link href="#home">Home</Nav.Link>
							<Nav.Link href="#link">Link</Nav.Link>
							<NavDropdown title="Dropdown" id="dropdown">
								<NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
								<NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
								<NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
								<NavDropdown.Divider/>
								<NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
							</NavDropdown>
						</Nav>
						<Form inline>
							<FormControl type="text" placeholder="Search"/>
							<Button>Search</Button>
						</Form>
					</Navbar.Collapse>
				</Navbar>
			</div>
			<h2>Pagination</h2>
			<div style={{overflow: "auto"}}>
				<Pagination>
					<Pagination.First/>
					<Pagination.Prev/>
					<Pagination.Item>{1}</Pagination.Item>
					<Pagination.Ellipsis/>
					<Pagination.Item>{10}</Pagination.Item>
					<Pagination.Item>{11}</Pagination.Item>
					<Pagination.Item active>{12}</Pagination.Item>
					<Pagination.Item>{13}</Pagination.Item>
					<Pagination.Item disabled>{14}</Pagination.Item>
					<Pagination.Ellipsis/>
					<Pagination.Item>{20}</Pagination.Item>
					<Pagination.Next/>
					<Pagination.Last/>
				</Pagination>
			</div>
			<h2>Popovers</h2>
			<div>
				<Popover id="popover" style={{position: "relative"}}>
					<Popover.Title>Popover right</Popover.Title>
					<Popover.Content>
						And here's some <strong>amazing</strong> content. It's very engaging.
						right?
					</Popover.Content>
				</Popover>
			</div>
			<h2>Progress</h2>
			<div>
				<ProgressBar now={60} label="60%"/>
				<ProgressBar>
					<ProgressBar variant="success" now={35} key={1}/>
					<ProgressBar striped variant="warning" now={20} key={2}/>
					<ProgressBar animated variant="danger" now={10} key={3}/>
				</ProgressBar>
			</div>
			<h2>Spinners</h2>
			<div>
				<Spinner animation="border"/>
				<Spinner animation="grow"/>
			</div>
			<h2>Tables</h2>
			<div>
				<Table striped bordered hover>
					<thead>
					<tr>
						<th>First Name</th>
						<th>Last Name</th>
						<th>Username</th>
					</tr>
					</thead>
					<tbody>
					<tr>
						<td>Mark</td>
						<td>Otto</td>
						<td>@mdo</td>
					</tr>
					<tr>
						<td>Jacob</td>
						<td>Thornton</td>
						<td>@fat</td>
					</tr>
					<tr>
						<td colSpan={2}>Larry the Bird</td>
						<td>@twitter</td>
					</tr>
					</tbody>
				</Table>
			</div>
			<h2>Tabs</h2>
			<div>
				<Tabs defaultActiveKey="home" transition={false} id="tabs">
					<Tab eventKey="home" title="Home"><p>Lorem ipsum</p></Tab>
					<Tab eventKey="profile" title="Profile"><p>Lorem ipsum</p></Tab>
					<Tab eventKey="contact" title="Contact" disabled><p>Lorem ipsum</p></Tab>
				</Tabs>
				<Tab.Container defaultActiveKey="first" id="tabs">
					<Row>
						<Col sm={3}>
							<Nav variant="pills" className="flex-column">
								<Nav.Item>
									<Nav.Link eventKey="first">Tab 1</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="second">Tab 2</Nav.Link>
								</Nav.Item>
							</Nav>
						</Col>
						<Col sm={9}>
							<Tab.Content>
								<Tab.Pane eventKey="first"><p>Lorem ipsum</p></Tab.Pane>
								<Tab.Pane eventKey="second"><p>Lorem ipsum</p></Tab.Pane>
							</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</div>
			<h2>Tooltips</h2>
			<div>
				<Tooltip id="tooltip">My Tooltip</Tooltip>
			</div>
			<h2>Toasts</h2>
			<div>
				<Toast>
					<Toast.Header>
						<img src="" alt=""/>
						<strong className="mr-auto">Bootstrap</strong>
						<small>11 mins ago</small>
					</Toast.Header>
					<Toast.Body>Hello, world! This is a toast message.</Toast.Body>
				</Toast>
			</div>
		</div>
	</Frame>;
}