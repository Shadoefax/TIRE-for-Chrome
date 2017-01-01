# TIRE-for-Chrome
Text Input Recovery Extension
 Known issues/fixes:

    Saved text is not encrypted.  It will remain unencrypted until the last stages of testing.
    TIRE options now has the option to highlight save-able fields with a user-defined color. If 'Highlight save-able fields' is checked, TIRE will change the background color of each page element it can save. This option can also be set/unset by right-clicking the TIRE toolbar icon and clicking "Highlight save-able fields".
    Some gmail fields are not working correctly. TIRE only intermittently recognizes the gmail draft text window. Since gmail auto-saves drafts, this may not be a problem that needs fixing.
    A TIRE button - - can optionally be shown on fields that have saved data. The options are "Always" and "Only while hovering". If this button is clicked, the saved text will populate the field. When hovering over the button, a tooltip will appear showing the saved text.
    Saving passwords is now optional.
    The TIRE toolbar icon 'Fill' badge is sporadic. Sometimes appears when there is no save data. Still working on it.


What this extension does:

TIRE saves the contents of all page fields in which a user can enter data.  Once the data has been stored and the page re-visited, the fields can be re-populated with the data last entered.



How this extension works:

Whenever a page is loaded (or gains focus), all elements in the DOM are parsed looking for "save-able" fields.  A field is considered save-able if it meets at least one of the following criteria:

    The element is an <INPUT> tag with a type attribute that is not one of the following:

        'button'
        'checkbox'
        'color'
        'file'
        'hidden'
        'image'
        'radio'
        'range'
        'reset'
        'submit'

    in which case the saved text is the value attribute of the <INPUT> field.

    The element is a <TEXTAREA> tag in which case the saved text is the value attribute.

    The element has a contenteditable attribute that evaluates to true (e.g., the compose window in gmail).  In this case, the saved text is the textContent attribute.



How to use this extension:

When the TIRE extension is installed and enabled, the TIRE icon will appear in the browser toolbar: TIRE icon (plain)
If there are saved fields in the database for the page (and the page has focus) or a field on the page has focus and an entry is on file for that field, the icon will appear with a "Fill" badge: TIRE icon (fill)
Clicking the icon while the "Fill" badge is shown will fill all fields with the saved text (if the page has focus) or fill just the focused field (if data for that field has been saved).

TIRE will scan the page every 5000 milliseconds (5 seconds - user definable) for any changes in the save-able fields. If changes are found, the database is updated and saved locally. If the field is blank, the database is not updated or saved.

TIRE options can be viewed by right-clicking the TIRE toolbar icon and clicking 'Options'.

The options screen allows for the changing of the check interval time and displays the pages for which TIRE has saved data. While TIRE is under alpha/beta release, there is also an option to view/clear the database. 
