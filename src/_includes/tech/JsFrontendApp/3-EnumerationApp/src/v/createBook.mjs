/**
 * @fileOverview  View methods for the use case "create book"
 * @author Gerd Wagner
 */
import Book, { BookCategoryEL, LanguageEL, PublicationFormEL } from "../m/Book.mjs";
import { fillSelectWithOptions, createChoiceWidget } from "../../lib/util.mjs";

const formEl = document.forms["Book"],
  origLangSelEl = formEl["originalLanguage"],
  otherAvailLangSelEl = formEl["otherAvailableLanguages"],
  categoryFieldsetEl = formEl.querySelector("fieldset[data-bind='category']"),
  pubFormsFieldsetEl = formEl.querySelector("fieldset[data-bind='publicationForms']"),
  saveButton = formEl["commit"];
// load all book records
Book.retrieveAll();
// set up the originalLanguage selection list
fillSelectWithOptions( origLangSelEl, LanguageEL.labels);
// set up the otherAvailableLanguages selection list
fillSelectWithOptions( otherAvailLangSelEl, LanguageEL.labels);
// set up the category radio button group
createChoiceWidget( categoryFieldsetEl, "category", [],
    "radio", BookCategoryEL.labels, true);
// set up the publicationForms checkbox group
createChoiceWidget( pubFormsFieldsetEl, "publicationForms", [],
    "checkbox", PublicationFormEL.labels);
// add event listeners for responsive validation
formEl.isbn.addEventListener("input", function () {
  formEl.isbn.setCustomValidity( Book.checkIsbnAsId( formEl.isbn.value).message);
});
formEl.title.addEventListener("input", function () {
  formEl.title.setCustomValidity( Book.checkTitle( formEl.title.value).message);
});
/*
// mandatory value check if otherAvailableLanguages would be mandatory
otherAvailLangSelEl.addEventListener("change", function () {
  otherAvailLangSelEl.setCustomValidity(
      (otherAvailLangSelEl.selectedOptions.length === 0) ?
          "At least one value must be selected!":"" );
});
*/
// mandatory value check
categoryFieldsetEl.addEventListener("click", function () {
  formEl.category[0].setCustomValidity(
    (!categoryFieldsetEl.getAttribute("data-value")) ?
      "A category must be selected!":"" );
});
// mandatory value check
pubFormsFieldsetEl.addEventListener("click", function () {
  const val = pubFormsFieldsetEl.getAttribute("data-value");
  formEl.publicationForms[0].setCustomValidity(
    (!val || Array.isArray(val) && val.length === 0) ?
      "At least one publication form must be selected!":"" );
});
// set an event handler for the submit/save button
saveButton.addEventListener("click", handleSaveButtonClickEvent);
// neutralize the submit event
formEl.addEventListener( 'submit', function (e) {
  e.preventDefault();
  formEl.reset();
});
// set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Book.saveAll);

// event handler for the submit/save button
function handleSaveButtonClickEvent() {
  const selectedOtherAvLangOptions = formEl.otherAvailableLanguages.selectedOptions;
  const slots = { isbn: formEl.isbn.value,
    title: formEl.title.value,
    originalLanguage: formEl.originalLanguage.value,
    otherAvailableLanguages: [],
    category: categoryFieldsetEl.getAttribute("data-value"),
    publicationForms: JSON.parse( pubFormsFieldsetEl.getAttribute("data-value"))
  };
  // construct the list of selected otherAvailableLanguages
  for (const o of selectedOtherAvLangOptions) {
    slots.otherAvailableLanguages.push( parseInt( o.value));
  }
  // set error messages in case of constraint violations
  formEl.isbn.setCustomValidity( Book.checkIsbnAsId( slots.isbn).message);
  formEl.title.setCustomValidity( Book.checkTitle( slots.title).message);
  formEl.originalLanguage.setCustomValidity( Book.checkOriginalLanguage(
      slots.originalLanguage).message);
  formEl.otherAvailableLanguages.setCustomValidity(
      Book.checkOtherAvailableLanguages( slots.otherAvailableLanguages).message);
  formEl.category[0].setCustomValidity(
      Book.checkCategory( slots.category).message);
  formEl.publicationForms[0].setCustomValidity(
      Book.checkPublicationForms( slots.publicationForms).message);
  // save the input data only if all form fields are valid
  if (formEl.checkValidity()) Book.add( slots);
}
