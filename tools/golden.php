<?php
// Runs the gainly.in calculators on random inputs and prints their summary numbers as JSON.
// Run from the gainly.in site folder: php path/to/tools/golden.php > test/golden.json
require getcwd() . '/vendor/autoload.php';
use App\Calculator\Calculators as C;
mt_srand(2026);
function r($a, $b, $step = 1) { return $a + $step * mt_rand(0, (int) (($b - $a) / $step)); }
function pick(array $a) { return $a[array_rand($a)]; }
function run($calc, array $in) {
    $res = $calc->calculate($in);
    $out = ['headline' => [$res->headline->label, $res->headline->value]];
    foreach ($res->summary as $s) { $out[$s->label] = $s->value; }
    return $out;
}
$cases = [];
for ($k = 0; $k < 40; $k++) {
    $in = ['monthly' => r(500, 100000, 500), 'rate' => r(1, 20, 0.5), 'years' => r(1, 40), 'stepUp' => pick([0, 0, 5, 10, 12.5])];
    $cases[] = ['sip', $in, run(new C\SipCalculator(), $in)];
    $in = ['amount' => r(1000, 10000000, 1000), 'rate' => r(1, 20, 0.5), 'years' => r(1, 40)];
    $cases[] = ['lumpsum', $in, run(new C\LumpsumCalculator(), $in)];
    $in = ['goal' => r(100000, 50000000, 10000), 'rate' => r(4, 18, 0.5), 'years' => r(1, 35), 'stepUp' => pick([0, 5, 10]), 'inflation' => pick([0, 0, 6])];
    $cases[] = ['sipGoal', $in, run(new C\SipGoalCalculator(), $in)];
    $in = ['amount' => r(10000, 20000000, 10000), 'rate' => r(0, 24, 0.25), 'years' => r(1, 30, 0.5)];
    $cases[] = ['emi', $in, run(new C\EmiCalculator(), $in)];
    $in = ['amount' => r(1000, 10000000, 1000), 'rate' => r(1, 10, 0.05), 'years' => r(0.25, 20, 0.25), 'compounding' => pick(['monthly', 'quarterly', 'half-yearly', 'yearly'])];
    $cases[] = ['fd', $in, run(new C\FdCalculator(), $in)];
    $in = ['monthly' => r(100, 100000, 100), 'rate' => r(4, 9, 0.1), 'months' => r(6, 120, 3)];
    $cases[] = ['rd', $in, run(new C\RdCalculator(), $in)];
    $in = ['yearly' => r(500, 150000, 500), 'rate' => r(6, 9, 0.1), 'years' => pick([15, 17, 20, 23, 25, 30, 40])];
    $cases[] = ['ppf', $in, run(new C\PpfCalculator(), $in)];
    $in = ['yearly' => r(250, 150000, 250), 'rate' => r(7, 9, 0.1), 'girlAge' => r(0, 10)];
    $cases[] = ['sukanya', $in, run(new C\SukanyaCalculator(), $in)];
    $in = ['principal' => r(0, 5000000, 1000), 'rate' => r(1, 15, 0.5), 'years' => r(1, 40), 'compounding' => pick(['yearly', 'half-yearly', 'quarterly', 'monthly', 'daily']), 'monthly' => pick([0, 0, 1000, 5000])];
    if ($in['principal'] == 0 && $in['monthly'] == 0) { $in['monthly'] = 1000; }
    $cases[] = ['compound', $in, run(new C\CompoundInterestCalculator(), $in)];
    $in = ['amount' => r(1000, 10000000, 1000), 'inflation' => r(1, 12, 0.5), 'years' => r(1, 40), 'mode' => pick(['future', 'today'])];
    $cases[] = ['inflation', $in, run(new C\InflationCalculator(), $in)];
    $in = ['basic' => r(10000, 300000, 1000), 'hra' => r(0, 150000, 1000), 'rent' => r(0, 150000, 1000), 'city' => pick(['metro', 'other'])];
    $cases[] = ['hra', $in, run(new C\HraCalculator(), $in)];
    $in = ['wages' => r(10000, 500000, 1000), 'years' => r(0, 40), 'months' => r(0, 11), 'covered' => pick(['yes', 'no']), 'type' => pick(['permanent', 'permanent', 'fixed'])];
    $cases[] = ['gratuity', $in, run(new C\GratuityCalculator(), $in)];
}
for ($k = 0; $k < 120; $k++) {
    $in = ['income' => pick([r(0, 1500000, 10000), r(1000000, 3000000, 5000), r(3000000, 80000000, 50000), pick([1200000, 1275000, 1280000, 1300000, 5000000, 5100000, 10050000, 20100000])]),
        'incomeType' => pick(['salary', 'salary', 'other']), 'age' => pick(['below60', '60to79', '80plus']),
        'd80c' => pick([0, 50000, 150000, 200000]), 'd80d' => pick([0, 25000, 75000]), 'hra' => pick([0, 120000, 300000]),
        'homeLoanInterest' => pick([0, 150000, 250000]), 'nps' => pick([0, 50000]), 'employerNps' => pick([0, 0, 60000, 200000]),
        'basicPay' => pick([0, 600000, 1200000]), 'otherDeductions' => pick([0, 20000])];
    $cases[] = ['incomeTax', $in, run(new C\IncomeTaxCalculator(), $in)];
}
echo json_encode($cases, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_PRESERVE_ZERO_FRACTION), "\n";
