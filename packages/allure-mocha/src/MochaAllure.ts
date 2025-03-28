import {
  Allure,
  AllureRuntime,
  AllureStep,
  AllureTest,
  AttachmentOptions,
  ContentType,
  ExecutableItemWrapper,
  isPromise,
  Status,
  StepInterface,
} from "allure-js-commons";
import { AllureReporter } from "./AllureReporter";
import { StepWrapper } from "./StepWrapper";

export class MochaAllure extends Allure {
  constructor(
    private readonly reporter: AllureReporter,
    runtime: AllureRuntime,
  ) {
    super(runtime);
  }

  protected get currentExecutable(): ExecutableItemWrapper {
    const executable: AllureStep | AllureTest | ExecutableItemWrapper | null =
      this.reporter.currentStep || this.reporter.currentTest || this.reporter.currentExecutable;
    if (!executable) {
      throw new Error("No executable!");
    }
    return executable;
  }

  protected set currentExecutable(executable: ExecutableItemWrapper) {
    this.reporter.currentExecutable = executable;
  }

  public step<T>(name: string, body: (step: StepInterface) => any): any {
    const wrappedStep = this.startStep(name);
    let result;
    try {
      result = wrappedStep.run(body);
    } catch (err) {
      wrappedStep.endStep();
      throw err;
    }
    if (isPromise(result)) {
      const promise = result as Promise<any>;
      return promise
        .then((a) => {
          wrappedStep.endStep();
          return a;
        })
        .catch((e) => {
          wrappedStep.endStep();
          throw e;
        });
    }
    wrappedStep.endStep();
    return result;
  }

  logStep(name: string, status?: Status): void {
    this.step(name, () => {}); // todo status
  }

  public attachment(
    name: string,
    content: Buffer | string,
    options: ContentType | string | AttachmentOptions,
  ): void {
    const file = this.reporter.writeAttachment(content, options);
    this.currentExecutable.addAttachment(name, options, file);
  }

  public testAttachment(
    name: string,
    content: Buffer | string,
    options: ContentType | string | AttachmentOptions,
  ): void {
    const file = this.reporter.writeAttachment(content, options);
    this.currentTest.addAttachment(name, options, file);
  }

  protected get currentTest(): AllureTest {
    if (this.reporter.currentTest === null) {
      throw new Error("No test running!");
    }
    return this.reporter.currentTest;
  }

  private startStep(name: string): StepWrapper {
    const allureStep: AllureStep = this.currentExecutable.startStep(name);
    this.reporter.pushStep(allureStep);
    return new StepWrapper(this.reporter, allureStep);
  }
}
