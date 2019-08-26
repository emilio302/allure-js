import { Status } from "allure-js-commons";
import { expect } from "chai";
import { suite } from "mocha-typescript";
import { findLabelValue, runTests } from "../utils";

@suite
class TagSuite {
  @test
  async shouldHaveTags() {
    const writerStub = await runTests("tag");
    const test = writerStub.getTestByName("shouldAssignTag");

    expect(test.status).eq(Status.PASSED);
    expect(findLabelValue(test, "tag")).eq("smoke");
  }
}
