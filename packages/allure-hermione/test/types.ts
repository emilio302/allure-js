import { AllureResults, AllureRuntime, Attachment, TestResult } from "allure-js-commons";
import Hermione from "hermione";

export interface AllureInMemoryWriter {
  results: TestResult[];
  attachments: Attachment[];
  writeResult: (result: AllureResults) => void;
  writeAttachment: (name: string, content: string, type: string) => void;
}

export interface HermioneAllureRuntime extends Omit<AllureRuntime, "writer"> {
  writer: AllureInMemoryWriter;
}

export interface HermioneAllure extends Hermione {
  allure: HermioneAllureRuntime;
}
