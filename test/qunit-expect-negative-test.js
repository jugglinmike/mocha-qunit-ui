console.log("Running child tests");

test('expect fails', function (){
  expect(25);
  ok(true);
});

test('expect fails async', function (done){
  expect(1);
  ok(true);
  setTimeout(function (){
    ok(true);
    done();
  }, 100);
});

test('expect fails using arguments', 25, function (){
  ok(true);
});

test('expect fails async using arguments', 1, function (done){
  ok(true);
  setTimeout(function (){
    ok(true);
    done();
  }, 100);
});

