const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());
const compiledPotluck = require('../ethereum/build/Potluck.json')

let potluckContract;
let manager;
let player1, player2;

beforeEach(async () => {
    // const accounts =  await web3.eth.getAccounts();
    // manager = accounts[0]
    [ manager, player1, player2] =  await web3.eth.getAccounts();
    potluckContract = new web3.eth.Contract(compiledPotluck.abi);
});

describe("Potluck", () => {

    async function createPotluck(ticketCount, ticketPrice) {
        return await potluckContract
            .deploy({
                data: compiledPotluck.evm.bytecode.object,
                arguments: [ticketCount, ticketPrice]
            })
            .send({
                gas: '1000000',
                from: manager
            });
    }

    describe("initialization", () => {
        it("set the manager", async () => {
            const potluck = await createPotluck(10, 200);

            assert.equal(manager, await potluck.methods.manager().call());
        });

        it("should initialize tickets", async () => {
            const potluck = await createPotluck(10, 200);

            assert.equal(200, await potluck.methods.ticketPrice().call());
            assert.equal(10, (await potluck.methods.getTickets().call()).length);
        });

        it("should not more than 100 tickets", async () => {
            try {
                await createPotluck(101, 200);
            } catch (err) {
                assertError("Number of entries can't be bigger than 100.", err);
                return;
            }
            assert.fail("It shouldn't be created with more than 100 tickets.");
        });
    });

    describe("join", () => {
        let potluck;
        beforeEach(async() => {
            potluck = await createPotluck(10, 200);
        });

        it("should register the player to the ticket", async () => {
            await potluck.methods
                .join(0)
                .send({
                    from: player1,
                    value: 200,
                    gas: '1000000'
                });

            assert.equal(player1, await potluck.methods.tickets(0).call());
        });

        it("should not allow if the payment is less than the ticket price", async () => {
            try {
                await potluck.methods
                    .join(0)
                    .send({
                        from: player1,
                        value: 150,
                        gas: '1000000'
                    });
            } catch (err) {
                assertError("Insufficient funds to buy ticket.", err);
                return;
            }
            assert.fail("It shouldn't register player paying less than ticket price.");
        });

        it("should not allow if the ticket has already been bought", async () => {
            try {
                await potluck.methods
                    .join(0)
                    .send({
                        from: player1,
                        value: 200,
                        gas: '1000000'
                    });

                await potluck.methods
                    .join(0)
                    .send({
                        from: player2,
                        value: 200,
                        gas: '1000000'
                    });
            } catch (err) {
                assertError("Ticket number is already taken.", err);
                return;
            }
            assert.fail("It shouldn't allow buying of already purchased ticket.");
        });
    });

    function assertError(message, error) {
        const key = Object.keys(error.results)[0]
        assert.equal(message, error.results[key].reason);
    }
});