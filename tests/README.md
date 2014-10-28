Test Running Protocal
=========

Due to timeouts and the async nature of this application there are intermittent failues.
Here are the steps to run your tests and fix tests.

* Run all your tests (either locally or on the CI).
* Mark each failing test with a `@failing` tag and run only the failing tests.
* Rerun the failing specs 2 times and take note which fail.
* Mark the tests that failed in the above runs with failing and remove those that do not match the criteria.
* Fix the marked tests.